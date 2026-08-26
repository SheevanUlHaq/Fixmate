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
                    string(credentialsId: 'fixmate-env', variable: 'FIXMATE_ENV')
                ]) {
                    sh '''
                        printf '%s\\n' "$FIXMATE_ENV" > backend/.env
                    '''
                }
            }
        }

        stage('Clean Docker') {
            steps {
                sh '''
                    docker compose down --remove-orphans || true
                    docker container prune -f
                    docker image prune -af
                    docker builder prune -af
                '''
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
                    docker compose down --remove-orphans
                    docker compose pull
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