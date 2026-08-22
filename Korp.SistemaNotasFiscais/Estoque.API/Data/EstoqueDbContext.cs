using Microsoft.EntityFrameworkCore;
using Estoque.API.Models;

namespace Estoque.API.Data
{
    public class EstoqueDbContext : DbContext
    {
        public EstoqueDbContext(DbContextOptions<EstoqueDbContext> options) : base(options) { }

        public DbSet<Produto> Produtos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Define que o 'Codigo' do produto deve ser único no banco
            modelBuilder.Entity<Produto>()
                .HasIndex(p => p.Codigo)
                .IsUnique();
        }
    }
}