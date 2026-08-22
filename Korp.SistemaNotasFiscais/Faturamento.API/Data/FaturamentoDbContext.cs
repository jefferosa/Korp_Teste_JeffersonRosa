using Microsoft.EntityFrameworkCore;
using Faturamento.API.Models;

namespace Faturamento.API.Data
{
    public class FaturamentoDbContext : DbContext
    {
        public FaturamentoDbContext(DbContextOptions<FaturamentoDbContext> options) : base(options) { }

        public DbSet<NotaFiscal> NotasFiscais { get; set; }
        public DbSet<ItemNotaFiscal> ItensNotaFiscal { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configura a numeração sequencial exigida pelo teste
            modelBuilder.Entity<NotaFiscal>()
                .Property(n => n.NumeroSequencial)
                .ValueGeneratedOnAdd();
        }
    }
}