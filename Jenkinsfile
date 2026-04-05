// Declarative pipeline — set REGISTRY_URL, IMAGE_REPO in Jenkins job env or below.

pipeline {
  agent any

  environment {
    // Example: REGISTRY_URL=docker.io  IMAGE_REPO=youruser  → image docker.io/youruser/demo-api
    REGISTRY_URL = "${env.REGISTRY_URL ?: 'docker.io'}"
    IMAGE_REPO   = "${env.IMAGE_REPO ?: 'akankshasingh23'}"
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_SHORT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.IMAGE_NAME = "${REGISTRY_URL}/${IMAGE_REPO}/demo-api"
          env.IMAGE_TAG = "${BUILD_NUMBER}-${env.GIT_SHORT_SHA}"
          env.FULL_IMAGE = "${env.IMAGE_NAME}:${env.IMAGE_TAG}"
        }
      }
    }

    
    stage('Build image') {
      steps {
        dir('application') {
          sh "docker build -t ${env.FULL_IMAGE} -t ${env.IMAGE_NAME}:latest ."
        }
      }
    }

    stage('Container smoke test') {
      steps {
        sh """
          docker rm -f demo-api-smoke 2>/dev/null || true
          docker run -d --name demo-api-smoke ${env.FULL_IMAGE}
          sleep 8          
          docker logs demo-api-smoke
          docker exec demo-api-smoke curl -fsS http://localhost:3000/health | grep -q ok
          docker rm -f demo-api-smoke
        """
      }
    }

    stage('Trivy scan') {
      steps {
        sh """
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
            aquasec/trivy:0.50.2 image --severity HIGH,CRITICAL ${env.FULL_IMAGE}
        """
      }
    }

    stage('Push image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker_creds', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh """
            echo "\$REG_PASS" | docker login ${REGISTRY_URL} -u "\$REG_USER" --password-stdin
            docker push ${env.FULL_IMAGE}
            docker push ${env.IMAGE_NAME}:latest
          """
        }
      }
    }
  }
  
      
  post {
    failure {
      echo 'Failed stage — no push if failure occurred before Push (check Trivy or tests).'
    }
  }
}

