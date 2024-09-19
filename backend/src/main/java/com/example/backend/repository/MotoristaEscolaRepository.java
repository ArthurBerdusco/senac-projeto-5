package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.model.MotoristaEscola;

public interface MotoristaEscolaRepository extends JpaRepository<MotoristaEscola, Long>{
    List<MotoristaEscola> findByMotoristaId(Long idMotorista);
}
