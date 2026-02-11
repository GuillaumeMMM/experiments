import groceries from '../../assets/groceries.json';
const data = groceries.reduce((prev, curr) => {
    prev.set(curr.store, (prev.get(curr.store) || 0) + curr.price)
    return prev
}, new Map())

export default Array.from(data);