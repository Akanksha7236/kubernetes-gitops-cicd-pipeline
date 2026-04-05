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
          docker run -d --name demo-api-smoke -p 13007:3000 ${env.FULL_IMAGE}
          sleep 3
          curl -fsS http://127.0.0.1:13007/health | grep -q ok
          docker rm -f demo-api-smoke
        """
      }
    }

    stage('Trivy scan') {
      steps {
        sh """
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
            aquasec/trivy:latest image --severity HIGH,CRITICAL --exit-code 1 ${env.FULL_IMAGE}
        """
      }
    }

    stage('Push image') {
      when {
        anyOf {
          branch 'main'
          branch 'master'
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'registry-cred', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh """
            echo "\$REG_PASS" | docker login ${REGISTRY_URL} -u "\$REG_USER" --password-stdin
            docker push ${env.FULL_IMAGE}
            docker push ${env.IMAGE_NAME}:latest
          """
        }
      }
    }

    stage('GitOps update (optional)') {
      when {
        anyOf {
          branch 'main'
          branch 'master'
        }
      }
      steps {
        echo 'Wire to: clone env repo, set image digest/tag, commit, push — or Argo CD Image Updater / Flux Image Automation'
      }
    }
  }

  post {
    failure {
      echo 'Failed stage — no push if failure occurred before Push (check Trivy or tests).'
    }
  }
}
