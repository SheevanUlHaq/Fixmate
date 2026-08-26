pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {

        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Create Environment') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'fixmate-env',
                        variable: 'FIXMATE_ENV'
                    )
                ]) {
                    sh '''
                        printf '%s\\n' "$FIXMATE_ENV" > backend/.env
                        chmod 600 backend/.env
                    '''
                }
            }
        }

        stage('Clean Old Containers') {
            steps {
                sh '''
                    docker compose down --remove-orphans || true
                    docker container prune -f
                '''
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                    COMPOSE_PARALLEL_LIMIT=1 \
                    docker compose build backend
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                    COMPOSE_PARALLEL_LIMIT=1 \
                    docker compose build frontend
                '''
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                            --username "$DOCKER_USERNAME" \
                            --password-stdin

                        docker compose push

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose pull
                    docker compose up -d --remove-orphans
                '''
            }
        }

        stage('Cleanup Docker') {
            steps {
                sh '''
                    docker container prune -f
                    docker image prune -f
                    docker builder prune -f --filter "until=24h"
                '''
            }
        }
    }

    post {
        always {
            sh 'rm -f backend/.env'
        }

        success {
            echo 'FixMate CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'FixMate CI/CD pipeline failed.'
        }
    }
}