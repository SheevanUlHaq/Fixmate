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
                    string(credentialsId: 'mongodb-uri', variable: 'MONGODB_URI'),
                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'cloudinary-name', variable: 'CLOUDINARY_CLOUD_NAME'),
                    string(credentialsId: 'cloudinary-key', variable: 'CLOUDINARY_API_KEY'),
                    string(credentialsId: 'cloudinary-secret', variable: 'CLOUDINARY_API_SECRET')
                ]) {
                    sh '''
                        printf '%s\\n' \
                            "PORT=5000" \
                            "MONGODB_URI=$MONGODB_URI" \
                            "JWT_SECRET=$JWT_SECRET" \
                            "CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME" \
                            "CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY" \
                            "CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET" \
                            "CLIENT_URL=http://13.203.207.59:5173" \
                            > backend/.env

                        chmod 600 backend/.env
                    '''
                }
            }
        }

        stage('Clean Old Docker Resources') {
            steps {
                sh '''
                    docker container prune -f
                    docker image prune -f
                    docker builder prune -f --filter "until=24h"
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