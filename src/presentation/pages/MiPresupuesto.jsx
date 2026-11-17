import { Link } from 'react-router-dom'
import { useQuote } from '../../application/quote/QuoteContext'
import { publicUrl } from '../utils/assets'

export default function MiPresupuesto() {
  const { items, updateQuantity, removeItem, clear } = useQuote()
  return <div className="quote-page">
    <div className="container quote-shell">
      <p className="product-kicker">Selección profesional</p>
      <h1>Mi presupuesto</h1>
      <p className="quote-lead">Revisa los productos y configuraciones que quieres incluir en una única solicitud.</p>
      {!items.length ? <div className="quote-empty"><h2>Aún no has añadido productos</h2><p>Explora el catálogo y guarda las referencias que quieras consultar.</p><Link className="btn btn-primary" to="/productos">Ver productos</Link></div> : <>
        <div className="quote-list">{items.map((item) => <article className="quote-line" key={item.id}>
          <img src={publicUrl(item.image) || 'images/placeholder.svg'} alt="" />
          <div className="quote-line-info"><h2>{item.name}</h2><p className="ref">Ref. {item.reference}</p>{item.variantRows?.length > 0 && <dl>{item.variantRows.map((row) => <div key={`${row.label}-${row.value}`}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>}</div>
          <label className="quote-quantity">Cantidad<input type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateQuantity(item.id, event.target.value)} /></label>
          <button type="button" className="quote-remove" onClick={() => removeItem(item.id)}>Eliminar</button>
        </article>)}</div>
        <div className="quote-actions"><Link className="btn btn-outline" to="/productos">Seguir viendo productos</Link><button type="button" className="quote-clear" onClick={clear}>Vaciar selección</button><Link className="btn btn-primary" to="/presupuesto/solicitar">Solicitar presupuesto <span aria-hidden="true">→</span></Link></div>
      </>}
    </div>
  </div>
}
