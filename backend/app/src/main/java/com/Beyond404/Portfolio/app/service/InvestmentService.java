package com.Beyond404.Portfolio.app.service;

import com.Beyond404.Portfolio.app.model.AssetHolding;
import com.Beyond404.Portfolio.app.model.Investment;
import com.Beyond404.Portfolio.app.model.StockTransactionRequest;
import com.Beyond404.Portfolio.app.model.StockTransactionResponse;
import com.Beyond404.Portfolio.app.model.Stocks;
import com.Beyond404.Portfolio.app.repository.AssetHoldingRepository;
import com.Beyond404.Portfolio.app.repository.CustomerRepository;
import com.Beyond404.Portfolio.app.repository.InvestmentRepository;
import com.Beyond404.Portfolio.app.repository.StocksRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;

@Service
public class InvestmentService {

    private static final String BUY = "BUY";
    private static final String SELL = "SELL";
    private static final Set<String> SUPPORTED_MARKETS = Set.of(
            "NYSE",
            "NASDAQ",
            "EURONEXT",
            "NSE",
            "BSE"
    );

    private final InvestmentRepository investmentRepository;
    private final StocksRepository stocksRepository;
    private final AssetHoldingRepository assetHoldingRepository;
    private final CustomerRepository customerRepository;

    public InvestmentService(
            InvestmentRepository investmentRepository,
            StocksRepository stocksRepository,
            AssetHoldingRepository assetHoldingRepository,
            CustomerRepository customerRepository) {
        this.investmentRepository = investmentRepository;
        this.stocksRepository = stocksRepository;
        this.assetHoldingRepository = assetHoldingRepository;
        this.customerRepository = customerRepository;
    }

    public ArrayList<Investment> getAllInvestments() {
        return investmentRepository.getAllInvestments();
    }

    public Investment findById(Long id) {
        return investmentRepository.findById(id);
    }

    public Investment createInvestment(Investment investment) {
        return investmentRepository.createInvestment(investment);
    }

    public boolean updateInvestment(Long id, Investment investment) {
        return investmentRepository.updateInvestment(id, investment);
    }

    public boolean deleteInvestment(Long id) {
        return investmentRepository.deleteInvestment(id);
    }

    @Transactional
    public StockTransactionResponse buyStock(StockTransactionRequest request) {
        return processTransaction(request, BUY);
    }

    @Transactional
    public StockTransactionResponse sellStock(StockTransactionRequest request) {
        return processTransaction(request, SELL);
    }

    private StockTransactionResponse processTransaction(StockTransactionRequest request, String endpointTransactionType) {
        validateRequest(request, endpointTransactionType);

        if (!customerRepository.existsById(request.getCustomerId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Customer not found: " + request.getCustomerId()
            );
        }

        String normalizedTicker = normalizeUpper(request.getTicker());
        String normalizedMarket = normalizeUpper(request.getStockMarket());
        String normalizedStockName = normalizeText(request.getStockName());
        BigDecimal quantity = request.getQuantity().stripTrailingZeros();
        BigDecimal transactionAmount = request.getTransactionAmount().stripTrailingZeros();

        Stocks stock = stocksRepository.findByTickerAndMarket(normalizedTicker, normalizedMarket);

        if (BUY.equals(endpointTransactionType) && stock == null) {
            Stocks newStock = new Stocks(null, normalizedStockName, normalizedTicker, normalizedMarket);
            stock = stocksRepository.createStock(newStock);
        }

        if (stock == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Stock not found for ticker " + normalizedTicker + " in market " + normalizedMarket
            );
        }

        Investment investment = new Investment();
        investment.setCustomerId(request.getCustomerId());
        investment.setStockId(stock.getStockId());
        investment.setTransactionType(endpointTransactionType);
        investment.setQuantity(quantity);
        investment.setTransactionAmount(transactionAmount);

        Investment createdInvestment = investmentRepository.createInvestment(investment);
        AssetHolding existingHolding = assetHoldingRepository.findByCustomerIdAndStockId(
                request.getCustomerId(),
                stock.getStockId()
        );

        if (BUY.equals(endpointTransactionType)) {
            return handleBuyHolding(createdInvestment, stock, existingHolding, quantity);
        }

        return handleSellHolding(createdInvestment, stock, existingHolding, quantity);
    }

    private StockTransactionResponse handleBuyHolding(
            Investment createdInvestment,
            Stocks stock,
            AssetHolding existingHolding,
            BigDecimal purchasedQuantity) {

        AssetHolding persistedHolding;
        BigDecimal updatedQuantity;

        if (existingHolding == null) {
            AssetHolding newHolding = new AssetHolding(
                    null,
                    createdInvestment.getCustomerId(),
                    stock.getStockId(),
                    purchasedQuantity.doubleValue()
            );
            persistedHolding = assetHoldingRepository.createAssetHolding(newHolding);
            updatedQuantity = purchasedQuantity;
        } else {
            updatedQuantity = BigDecimal.valueOf(existingHolding.getQuantity()).add(purchasedQuantity);
            existingHolding.setQuantity(updatedQuantity.doubleValue());
            assetHoldingRepository.updateAssetHolding(existingHolding.getHoldingId(), existingHolding);
            persistedHolding = assetHoldingRepository.findById(existingHolding.getHoldingId());
        }

        return new StockTransactionResponse(
                "Stock purchase recorded successfully.",
                stock,
                createdInvestment,
                persistedHolding,
                updatedQuantity.doubleValue(),
                false
        );
    }

    private StockTransactionResponse handleSellHolding(
            Investment createdInvestment,
            Stocks stock,
            AssetHolding existingHolding,
            BigDecimal soldQuantity) {

        if (existingHolding == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No holding found for customer "
                            + createdInvestment.getCustomerId()
                            + " and stock "
                            + stock.getStockId()
            );
        }

        BigDecimal currentQuantity = BigDecimal.valueOf(existingHolding.getQuantity());
        if (currentQuantity.compareTo(soldQuantity) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Insufficient holding quantity. Available: "
                            + currentQuantity.toPlainString()
                            + ", requested to sell: "
                            + soldQuantity.toPlainString()
            );
        }

        BigDecimal updatedQuantity = currentQuantity.subtract(soldQuantity);

        if (updatedQuantity.compareTo(BigDecimal.ZERO) == 0) {
            assetHoldingRepository.deleteAssetHolding(existingHolding.getHoldingId());
            return new StockTransactionResponse(
                    "Stock sale recorded successfully and holding was closed.",
                    stock,
                    createdInvestment,
                    null,
                    0.0,
                    true
            );
        }

        existingHolding.setQuantity(updatedQuantity.doubleValue());
        assetHoldingRepository.updateAssetHolding(existingHolding.getHoldingId(), existingHolding);
        AssetHolding persistedHolding = assetHoldingRepository.findById(existingHolding.getHoldingId());

        return new StockTransactionResponse(
                "Stock sale recorded successfully.",
                stock,
                createdInvestment,
                persistedHolding,
                updatedQuantity.doubleValue(),
                false
        );
    }

    private void validateRequest(StockTransactionRequest request, String endpointTransactionType) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        if (request.getCustomerId() == null || request.getCustomerId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid customerId is required");
        }

        if (isBlank(request.getTicker())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticker is required");
        }

        if (isBlank(request.getStockMarket())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock market is required");
        }

        String normalizedMarket = normalizeUpper(request.getStockMarket());
        if (!SUPPORTED_MARKETS.contains(normalizedMarket)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported stock market: " + request.getStockMarket()
            );
        }

        if (BUY.equals(endpointTransactionType) && isBlank(request.getStockName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock name is required for buy transactions");
        }

        if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero");
        }

        if (request.getTransactionAmount() == null || request.getTransactionAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction amount must be greater than zero");
        }

        if (isBlank(request.getTransactionType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transaction type is required");
        }

        String normalizedTransactionType = normalizeUpper(request.getTransactionType());
        if (!endpointTransactionType.equals(normalizedTransactionType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Transaction type must be " + endpointTransactionType + " for this endpoint"
            );
        }
    }

    private String normalizeUpper(String value) {
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeText(String value) {
        return value == null ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}

