pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Show Environment') {
            steps {
                bat 'git branch --show-current'
                bat 'docker --version'
                bat 'docker compose version'
            }
        }

        stage('Build Services') {
            steps {
                bat 'docker compose -f %COMPOSE_FILE% build'
            }
        }

        stage('Deploy Services') {
            steps {
                bat 'docker compose -f %COMPOSE_FILE% up -d'
            }
        }

        stage('Verify Deployment') {
            steps {
                bat 'docker compose -f %COMPOSE_FILE% ps'
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully.'
        }
        failure {
            echo 'Deployment failed.'
            bat 'docker compose -f %COMPOSE_FILE% ps'
        }
        always {
            cleanWs()
        }
    }
}
