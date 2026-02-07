import groceries from '../../assets/data.json';

export default groceries.sort((a, b) => a.name > b.name ? 1 : -1);