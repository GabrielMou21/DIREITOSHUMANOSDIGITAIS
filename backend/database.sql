CREATE DATABASE dhdigital;
USE dhdigital;

CREATE TABLE denuncias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  anonimo BOOLEAN DEFAULT TRUE,
  contato VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pesquisas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  idade VARCHAR(50),
  conhece_lgpd VARCHAR(10),
  sofreu_violacao VARCHAR(10),
  tipo_violacao VARCHAR(100),
  confianca_denunciar VARCHAR(50),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_resultados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pontuacao INT NOT NULL,
  total INT NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);