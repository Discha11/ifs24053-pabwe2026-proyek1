pipeline {
  agent any
  tools { nodejs 'node-22' }   // sesuaikan dengan nama NodeJS di Manage Jenkins > Tools
  stages {
    stage('Checkout')          { steps { checkout scm } }
    stage('Install front-end') { steps { dir('frontend') { sh 'npm ci' } } }
    stage('Build front-end')   { steps { dir('frontend') { sh 'npm run build' } } }
    stage('Archive')           { steps { archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true } }
  }
  post {
    success { echo 'Build front-end berhasil.' }
    failure { echo 'Pipeline gagal, periksa log stage di atas.' }
  }
}
