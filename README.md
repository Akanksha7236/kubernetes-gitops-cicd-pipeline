# Kubernetes GitOps CI/CD Pipeline (Jenkins + ArgoCD)

This project demonstrates a complete **end-to-end CI/CD pipeline** using:

* **Jenkins** → Continuous Integration (CI)
* **Docker** → Containerization
* **DockerHub** → Image Registry
* **ArgoCD** → Continuous Deployment (CD)
* **Kubernetes (Minikube)** → Deployment Platform


## Key Features

- End-to-end CI/CD pipeline using Jenkins + ArgoCD  
- GitOps-based deployment (Git as source of truth)  
- Automated Docker image build and push  
- Vulnerability scanning using Trivy  
- Rolling updates with zero downtime  
- Self-healing deployments via ArgoCD  

---

## Architecture Overview

```
Developer Push → GitHub
        ↓
     Jenkins (CI)
   - Build Image
   - Test
   - Scan (Trivy)
   - Push to DockerHub
   - Update deployment.yaml
        ↓
     GitHub (updated manifest)
        ↓
     ArgoCD (CD)
        ↓
     Kubernetes (Deployment)
```

---

## Tech Stack

* Kubernetes (Minikube)
* Jenkins (Pipeline)
* Docker
* ArgoCD
* GitHub
* Trivy (Security scanning)

---

## Workflow

1. Developer pushes code to GitHub
2. Jenkins pipeline is triggered
3. Jenkins:

   * Builds Docker image
   * Runs smoke test
   * Scans image using Trivy
   * Pushes image to DockerHub
4. Jenkins updates `deployment.yaml` with new image tag
5. Jenkins commits and pushes changes to GitHub
6. ArgoCD detects Git change
7. ArgoCD syncs and deploys to Kubernetes
8. Kubernetes performs rolling update

---

## Project Structure

```
.
├── application/        # App source code + Dockerfile
├── kubernetes/         # K8s manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   ├── namespace.yaml
│   └── kustomization.yaml
├── gitops/
│   └── argocd-application.yaml
├── Jenkinsfile
└── README.md
```

---

## Setup Instructions

### 1. Start Kubernetes

```bash
minikube start
```

---

### 2. Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

### 3. Apply ArgoCD Application

```bash
kubectl apply -f gitops/argocd-application.yaml
```

---

### 4. Run Jenkins

```bash
docker run -d \
  -p 8081:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins \
  jenkins/jenkins:lts
```

---

### 5. Configure Jenkins

* Add credentials:

  * `docker_creds` → DockerHub
  * `git_creds` → GitHub PAT
* Create pipeline job
* Connect GitHub repo
* Run pipeline

---

## Verification

### Check ArgoCD status

```bash
kubectl get applications -n argocd
```

---

### Check pods

```bash
kubectl get pods -n demo-api-dev
```

---

### Access service

```bash
minikube service demo-api-service -n demo-api-dev
```

---

## Security

* Credentials managed via Jenkins Credentials store
* No hardcoded secrets
* Image scanning using Trivy

---




