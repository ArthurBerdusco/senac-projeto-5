package com.example.backend.controller.api;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.CriancaDTO;
import com.example.backend.model.Ausencia;
import com.example.backend.model.Crianca;
import com.example.backend.model.Escola;
import com.example.backend.model.Motorista;
import com.example.backend.model.Responsavel;
import com.example.backend.repository.AusenciaRepository;
import com.example.backend.repository.CriancaRepository;
import com.example.backend.repository.EscolaRepository;
import com.example.backend.repository.ResponsavelRepository;

@RestController
public class CriancaController {

    @Autowired
    ResponsavelRepository responsavelRepository;

    @Autowired
    EscolaRepository escolaRepository;

    @Autowired
    CriancaRepository criancaRepository;

    @Autowired
    AusenciaRepository ausenciaRepository;

    @PostMapping
    public void salvar(@RequestBody Crianca crianca) {
        crianca.setStatus("Pendente ativação");
        criancaRepository.save(crianca);
    }

    // Exemplo de endpoint no Spring Boot
    @GetMapping("/crianca/responsavel/{id}")
    public ResponseEntity<List<Crianca>> getCriancasByResponsavel(@PathVariable Long id) {
        List<Crianca> criancas = criancaRepository.findByResponsavelId(id);

        if (criancas == null || criancas.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Collections.emptyList());
        }

        return ResponseEntity.ok(criancas);
    }

    @GetMapping("/criancas/{id}")
    public ResponseEntity<Crianca> getCrianca(@PathVariable Long id) {

        // Usando Optional para verificar se a criança existe
        Optional<Crianca> criancaOptional = criancaRepository.findById(id);

        if (!criancaOptional.isPresent()) {
            // Retorna 404 se a criança não for encontrada
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Se a criança existir, retorna o objeto encontrado
        Crianca crianca = criancaOptional.get();
        return ResponseEntity.ok(crianca);
    }

    @PostMapping("/crianca")
    public ResponseEntity<String> cadastroCrianca(@RequestBody CriancaDTO dto) {
        try {
            Crianca crianca = new Crianca();
            crianca.setNome(dto.getNome());
            crianca.setDataNascimento(dto.getDataNascimento());
            crianca.setPeriodo(dto.getPeriodo());
            crianca.setResponsavel(responsavelRepository.findById(dto.getIdResponsavel()).orElseThrow());

            criancaRepository.save(crianca);
            return ResponseEntity.status(HttpStatus.CREATED).body("Crianca cadastrada com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao cadastrar a criança.");
        }
    }

    @PostMapping("/cadastro-crianca/{escolaId}/{responsavelId}")
    public ResponseEntity<String> cadastrarCrianca(@PathVariable Long escolaId, @PathVariable Long responsavelId,
            @RequestBody Crianca crianca) {
        try {
            // Supondo que a crianca seja associado a um responsável
            Optional<Responsavel> optionalResponsavel = responsavelRepository.findById(responsavelId);

            Optional<Escola> optionalEscola = escolaRepository.findById(escolaId);

            if (optionalResponsavel.isPresent() && optionalEscola.isPresent()) {
                Responsavel responsavel = optionalResponsavel.get();
                Escola escola = optionalEscola.get();
                // Cria um novo objeto Endereco e define seus atributos
                Crianca novaCrianca = new Crianca();
                novaCrianca.setNome(crianca.getNome());
                novaCrianca.setIdade(crianca.getIdade());
                novaCrianca.setStatus("Ativo");

                // Associa o endereço ao responsável
                crianca.setResponsavel(responsavel);
                crianca.setEscola(escola);

                // Salva o endereço no banco de dados
                criancaRepository.save(crianca);
                return ResponseEntity.status(HttpStatus.CREATED).body("Crianca cadastrada com sucesso!");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Responsável ou Escola não encontrado.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao cadastrar a criança.");
        }
    }

    @GetMapping("/crianca/{id}/motorista")
    public ResponseEntity<Motorista> getMotoristaCriancaId(@PathVariable Long id) {
        Optional<Crianca> criancaOptional = criancaRepository.findById(id);

        if (!criancaOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        Crianca crianca = criancaOptional.get();

        if (crianca.getMotorista() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Motorista motorista = crianca.getMotorista();

        return ResponseEntity.ok(motorista);
    }

    @PostMapping("/crianca/{id}/ausencias") // Endpoint para salvar ausências
    public ResponseEntity<Void> registrarAusencias(@PathVariable Long id, @RequestBody List<Ausencia> ausencias) {
        // Buscar a criança pelo ID
        Crianca crianca = criancaRepository.findById(id).orElse(null);
        if (crianca == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Criança não encontrada
        }

        // Associar a criança com cada ausência e salvar
        for (Ausencia ausencia : ausencias) {
            ausencia.setCrianca(crianca);
            ausenciaRepository.save(ausencia);
        }

        return ResponseEntity.status(HttpStatus.CREATED).build(); // Retorna 201 Created
    }

    @GetMapping("/ausencias/crianca/{id}")
    public List<Ausencia> getAusenciasPorCrianca(@PathVariable Long id) {
        return ausenciaRepository.findByCriancaId(id);
    }

    @DeleteMapping("/ausencias/{id}")
    public ResponseEntity<String> deleteAusencia(@PathVariable Long id) {
        try {
            System.out.println("\n\n\n" + "ENTREI AQUI" + "\n\n\n");
            if (!ausenciaRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Ausência não encontrada com o ID: " + id);
            }
            ausenciaRepository.deleteById(id);
            return ResponseEntity.ok("Ausência excluída com sucesso.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao excluir a ausência: " + e.getMessage());
        }
    }
}
