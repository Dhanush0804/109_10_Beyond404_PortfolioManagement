pipeline {
    agent any

    environment {
        COMPOSE_FILE = "${WORKSPACE}/docker-compose.yml"
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
                sh 'git branch --show-current || true'
                sh 'docker --version'
                sh 'docker-compose version'
                sh 'pwd'
                sh 'ls -la'
                sh 'test -f "$COMPOSE_FILE"'
            }
        }

        stage('Build Services') {
            steps {
                sh 'docker-compose -f $COMPOSE_FILE build'
            }
        }

        stage('Deploy Services') {
            steps {
                sh 'docker-compose -f $COMPOSE_FILE down --remove-orphans || true'
                sh 'docker-compose -f $COMPOSE_FILE up -d'
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'docker-compose -f $COMPOSE_FILE ps'
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully.'
        }
        failure {
            echo 'Deployment failed.'
            sh 'docker-compose -f $COMPOSE_FILE ps || true'
        }
        cleanup {
            cleanWs()
        }
    }
}
