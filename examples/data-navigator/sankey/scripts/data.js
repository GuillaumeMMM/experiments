import groceries from '../../assets/groceries.json';

const shops = Array.from(groceries.reduce((prev, curr) => {
    prev.set(curr.store, (prev.get(curr.store) || 0) + curr.price)
    return prev
}, new Map()))

const products = groceries.reduce((prev, curr) => {
    prev[curr.store] = { ...(prev[curr.store] || {}), [curr.name]: curr.price }
    return prev
}, {})

const productNames = Array.from(new Set(groceries.map(g => g.name)))

const nodes = [{ name: 'Total', id: 'total' }].concat(shops.map(s => ({ name: s[0], id: s[0], type: 'shop' }))).concat(productNames.map(n => ({ name: n, id: n, type: 'product' })))
const links = shops.map(s => ({ source: 'total', target: s[0], value: s[1] }))

Object.entries(products).map(([store, pval]) => {
    Object.entries(pval).forEach(([product, price]) => {
        links.push({ source: store, target: product, value: price })
    })
})

export default { nodes, links };