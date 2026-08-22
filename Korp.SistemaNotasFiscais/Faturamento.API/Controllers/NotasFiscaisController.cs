using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Faturamento.API.Data;
using Faturamento.API.Models;
using Faturamento.API.DTOs;

namespace Faturamento.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotasFiscaisController : ControllerBase
    {
        private readonly FaturamentoDbContext _context;

        public NotasFiscaisController(FaturamentoDbContext context)
        {
            _context = context;
        }

        // POST: api/notasfiscais
        [HttpPost]
        public async Task<ActionResult<NotaFiscal>> PostNotaFiscal(CriarNotaFiscalDto dto)
        {
            // O requisito pede numeração sequencial. 
            // Usamos LINQ para descobrir o último número gerado e somar 1.
            int ultimoNumero = await _context.NotasFiscais
                .MaxAsync(n => (int?)n.NumeroSequencial) ?? 0;

            var notaFiscal = new NotaFiscal
            {
                NumeroSequencial = ultimoNumero + 1,
                // O requisito obriga o status inicial como Aberta
                Status = StatusNota.Aberta,
                // Mapeando o DTO para a Entidade que vai para o banco
                Itens = dto.Itens.Select(i => new ItemNotaFiscal
                {
                    CodigoProduto = i.CodigoProduto,
                    Quantidade = i.Quantidade
                }).ToList()
            };

            _context.NotasFiscais.Add(notaFiscal);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNotaFiscal), new { id = notaFiscal.Id }, notaFiscal);
        }

        // GET: api/notasfiscais/{id}
        // Este endpoint é necessário para o retorno do CreatedAtAction acima
        [HttpGet("{id}")]
        public async Task<ActionResult<NotaFiscal>> GetNotaFiscal(int id)
        {
            // Usando LINQ (Include) para trazer os itens junto com a nota
            var notaFiscal = await _context.NotasFiscais
                .Include(n => n.Itens)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (notaFiscal == null)
            {
                return NotFound();
            }

            return Ok(notaFiscal);
        }
    }
}