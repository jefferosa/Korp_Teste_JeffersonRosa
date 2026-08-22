import { useState, useEffect } from 'react'
import { from, of } from 'rxjs'
import { catchError, finalize, switchMap, tap } from 'rxjs/operators'

interface Produto { codigo: string; descricao: string; saldo: number; }
interface ItemNota { codigoProduto: string; quantidade: number; }
interface NotaFiscal { id: number; numeroSequencial: number; status: number; itens: ItemNota[] }

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'produtos' | 'criar-nota' | 'listar-notas'>('produtos')

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-blue-800 p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex gap-4">
          <button onClick={() => setAbaAtiva('produtos')} className={`px-4 py-2 rounded font-semibold transition ${abaAtiva === 'produtos' ? 'bg-white text-blue-800' : 'text-white hover:bg-blue-700'}`}>📦 Produtos</button>
          <button onClick={() => setAbaAtiva('criar-nota')} className={`px-4 py-2 rounded font-semibold transition ${abaAtiva === 'criar-nota' ? 'bg-white text-blue-800' : 'text-white hover:bg-blue-700'}`}>🧾 Emitir Nota</button>
          <button onClick={() => setAbaAtiva('listar-notas')} className={`px-4 py-2 rounded font-semibold transition ${abaAtiva === 'listar-notas' ? 'bg-white text-blue-800' : 'text-white hover:bg-blue-700'}`}>🖨️ Controle de Notas</button>
        </div>
      </nav>

      <main className="flex-1 p-6 flex justify-center items-start">
        {abaAtiva === 'produtos' && <TelaCadastroProduto />}
        {abaAtiva === 'criar-nota' && <TelaCriarNota mudarAba={setAbaAtiva} />}
        {abaAtiva === 'listar-notas' && <TelaListarNotas />}
      </main>
    </div>
  )
}

// ==========================================
// COMPONENTE 1: TELA DE PRODUTOS
// ==========================================
function TelaCadastroProduto() {
  const [codigo, setCodigo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [saldo, setSaldo] = useState<number | ''>('')
  
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => { carregarProdutos() }, [])

  const carregarProdutos = async () => {
    try {
      const res = await fetch('http://localhost:5192/api/produtos')
      if (res.ok) setProdutos(await res.json())
    } catch (e) { console.error(e) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMensagem(''); setErro('')
    try {
      const res = await fetch('http://localhost:5192/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, descricao, saldo: Number(saldo) })
      })

      if (res.ok) {
        setMensagem('Produto cadastrado com sucesso!')
        setCodigo(''); setDescricao(''); setSaldo('')
        carregarProdutos()
      } else {
        const errJson = await res.json()
        setErro(errJson.mensagem || 'Erro ao cadastrar produto.')
      }
    } catch (e) { setErro('Erro de conexão com o Estoque.') }
  }

  return (
    <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 h-fit">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Novo Produto</h2>
        {mensagem && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-sm">{mensagem}</div>}
        {erro && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{erro}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Código</label>
            <input type="text" required value={codigo} onChange={(e) => setCodigo(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Ex: PRD-001" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
            <input type="text" required value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Ex: Teclado Mecânico" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Saldo Inicial</label>
            <input type="number" required min="0" value={saldo} onChange={(e) => setSaldo(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border p-2 rounded text-sm" placeholder="0" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded text-sm hover:bg-blue-700">Salvar</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-2/3 h-fit">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Produtos Cadastrados</h2>
        <table className="min-w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-2">Código</th>
              <th className="p-2">Descrição</th>
              <th className="p-2 text-right">Saldo Atual</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {produtos.map(p => (
              <tr key={p.codigo} className="hover:bg-gray-50">
                <td className="p-2 font-medium text-gray-800">{p.codigo}</td>
                <td className="p-2">{p.descricao}</td>
                <td className="p-2 text-right font-mono">{p.saldo}</td>
              </tr>
            ))}
            {produtos.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-400">Nenhum produto cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==========================================
// COMPONENTE 2: TELA CRIAR NOTA
// ==========================================
function TelaCriarNota({ mudarAba }: { mudarAba: (aba: any) => void }) {
  const [produtosDisp, setProdutosDisp] = useState<Produto[]>([])
  const [codigoProduto, setCodigoProduto] = useState('')
  const [quantidade, setQuantidade] = useState<number | ''>('')
  const [itens, setItens] = useState<{ codigoProduto: string, descricao: string, quantidade: number }[]>([])
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => { 
    fetch('http://localhost:5192/api/produtos')
      .then(res => res.json())
      .then(setProdutosDisp)
      .catch(e => console.error(e)) 
  }, [])

  const adicionarItem = () => {
    if (!codigoProduto || !quantidade) return
    const desc = produtosDisp.find(p => p.codigo === codigoProduto)?.descricao || 'Desconhecido'
    setItens([...itens, { codigoProduto, descricao: desc, quantidade: Number(quantidade) }])
    setCodigoProduto('')
    setQuantidade('')
  }

  const removerItemTemp = (index: number) => {
    const novos = [...itens]
    novos.splice(index, 1)
    setItens(novos)
  }

  const handleEmitirNota = async () => {
    setMensagem(''); setErro('')
    if (itens.length === 0) {
      setErro('Adicione pelo menos um item à nota.')
      return
    }

    try {
      const payloadItens = itens.map(i => ({ codigoProduto: i.codigoProduto, quantidade: i.quantidade }))
      const res = await fetch('http://localhost:5055/api/notasfiscais', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: payloadItens })
      })

      if (res.ok) {
        setMensagem('Nota Fiscal criada com status ABERTA com sucesso!')
        setItens([])
        setTimeout(() => mudarAba('listar-notas'), 1500)
      } else {
        const errorText = await res.text()
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.errors) {
            const primeiroErro = Object.keys(errorJson.errors)[0]
            setErro(errorJson.errors[primeiroErro][0])
          } else if (errorJson.title) {
            setErro(errorJson.title)
          } else {
            setErro('Erro ao emitir nota.')
          }
        } catch (e) {
          setErro(errorText ||'Erro ao emitir nota.')
        }
      }
    } catch (e) { setErro('Erro de conexão com o Faturamento.') }
  }

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Emitir Nova Nota Fiscal</h2>
      {mensagem && <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded text-sm">{mensagem}</div>}
      {erro && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{erro}</div>}
      
      <div className="bg-blue-50 p-4 rounded border mb-6 flex flex-col sm:flex-row gap-2 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-600 mb-1">Produto</label>
          <select value={codigoProduto} onChange={e => setCodigoProduto(e.target.value)} className="w-full border p-2 rounded text-sm bg-white">
            <option value="" disabled>-- Selecione --</option>
            {produtosDisp.map(p => <option key={p.codigo} value={p.codigo}>{p.codigo} - {p.descricao} (Estoque: {p.saldo})</option>)}
          </select>
        </div>
        <div className="w-full sm:w-24">
          <label className="block text-xs font-medium text-gray-600 mb-1">Qtd</label>
          <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border p-2 rounded text-sm" placeholder="1" />
        </div>
        <button type="button" onClick={adicionarItem} className="w-full sm:w-auto bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm h-[38px]">Add</button>
      </div>

      <ul className="border rounded divide-y mb-6">
        {itens.map((i, idx) => (
          <li key={idx} className="p-3 flex justify-between items-center text-sm bg-white">
            <span><strong>{i.codigoProduto}</strong> - {i.descricao} (Qtd: {i.quantidade})</span>
            <button type="button" onClick={() => removerItemTemp(idx)} className="text-red-500 font-bold hover:underline text-xs">Remover</button>
          </li>
        ))}
        {itens.length === 0 && <li className="p-4 text-center text-gray-400 text-sm">Nenhum item adicionado.</li>}
      </ul>

      <button onClick={handleEmitirNota} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition shadow-sm">
        Gravar Nota (Status: Aberta)
      </button>
    </div>
  )
}

// ==========================================
// COMPONENTE 3: LISTAR NOTAS & RXJS (Card 9)
// ==========================================
function TelaListarNotas() {
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => { carregarNotas() }, [])

  const carregarNotas = async () => {
    try {
      const res = await fetch('http://localhost:5055/api/notasfiscais')
      if (res.ok) setNotas(await res.json())
    } catch (e) { console.error(e) }
  }

  // Ação de Impressão utilizando RxJS perfeitamente integrada com feedback visual
  const handleImprimirRxJS = (id: number) => {
    setLoadingId(id)
    setMensagem(''); setErro('')

    from(fetch(`http://localhost:5055/api/notasfiscais/${id}/imprimir`, { method: 'POST' }))
      .pipe(
        switchMap(async (res) => {
          if (!res.ok) {
            const errorText = await res.text()
            throw new Error(errorText || `Erro HTTP: ${res.status}`)
          }
          return res.json()
        }),
        tap(() => {
          setMensagem(`Sucesso! Nota #${id} impressa e estoque deduzido.`)
          carregarNotas()
        }),
        catchError((err) => {
          const msg = err.message.includes('Failed to fetch') ? 'API de Faturamento fora do ar.' : err.message
          setErro(`Falha ao imprimir a Nota #${id}: ${msg}`)
          return of(null)
        }),
        finalize(() => {
          setLoadingId(null)
        })
      )
      .subscribe()
  }

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-5xl">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-800">Controle de Notas Fiscais</h2>
      {mensagem && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{mensagem}</div>}
      {erro && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{erro}</div>}
      
      <table className="min-w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-3">Num. Sequencial</th>
            <th className="p-3">Produtos / Itens da Nota</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {notas.map(n => (
            <tr key={n.id} className="hover:bg-gray-50">
              <td className="p-3 font-bold text-gray-800 align-top">#{n.numeroSequencial}</td>
              <td className="p-3 align-top">
                <div className="flex flex-col gap-1">
                  {n.itens?.map((item, idx) => (
                    <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-xs w-fit text-gray-700">
                      <strong className="text-gray-900">{item.codigoProduto}</strong> (Qtd: {item.quantidade})
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-3 align-top">
                <span className={`px-2 py-1 rounded text-xs font-bold ${n.status === 0 ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                  {n.status === 0 ? 'ABERTA' : 'FECHADA'}
                </span>
              </td>
              <td className="p-3 text-center align-top">
                {n.status === 0 ? (
                  <button 
                    onClick={() => handleImprimirRxJS(n.id)}
                    disabled={loadingId === n.id}
                    className={`px-4 py-2 rounded text-white font-semibold text-xs transition ${loadingId === n.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-sm'}`}
                  >
                    {loadingId === n.id ? '⏳ Processando...' : '🖨️ Imprimir'}
                  </button>
                ) : (
                  <span className="text-gray-400 italic text-xs">Já impressa</span>
                )}
              </td>
            </tr>
          ))}
          {notas.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-400">Nenhuma nota encontrada.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}