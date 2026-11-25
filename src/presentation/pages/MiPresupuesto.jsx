import { Link } from 'react-router-dom'
import { useQuote } from '../../application/quote/QuoteContext'
import { publicUrl } from '../utils/assets'

export default function MiPresupuesto({ analytics }) {
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
          <label className="quote-quantity">Cantidad<span className="quote-quantity-stepper"><button type="button" aria-label={`Reducir cantidad de ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button><output aria-live="polite">{item.quantity}</output><button type="button" aria-label={`Aumentar cantidad de ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button></span></label>
           <button type="button" className="quote-remove" aria-label={`Eliminar ${item.name}`} onClick={() => { removeItem(item.id); analytics?.track('remove_from_quote', { item_id: item.productId || item.id, quantity: item.quantity }) }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h8l1-13M10 11v5m4-5v5" /></svg></button>
        </article>)}</div>
        <div className="quote-actions"><Link className="btn btn-outline" to="/productos">Seguir viendo productos</Link><button type="button" className="quote-clear" onClick={clear}>Vaciar selección</button><Link className="btn btn-primary" to="/presupuesto/solicitar">Solicitar presupuesto <span aria-hidden="true">→</span></Link></div>
      </>}
    </div>
  </div>
}
