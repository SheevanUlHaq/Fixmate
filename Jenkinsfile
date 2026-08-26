pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
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
                        cat > backend/.env <<EOF
                        PORT=5000
                        MONGODB_URI=$MONGODB_URI
                        JWT_SECRET=$JWT_SECRET
                        CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
                        CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
                        CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET
                        CLIENT_URL=http://localhost:8080
                        EOF
                    '''
                }
            }
        }

        stage('Build Images') {
            steps {
                sh 'docker compose build'
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
                            -u "$DOCKER_USERNAME" \
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
                    docker compose up -d
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