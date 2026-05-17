import axios from 'axios';

async function test() {
    try {
        const res = await axios.post('http://localhost:8000/api/v1/customer/login', {
            email: 'sim.stock3@boutique.local',
            password: 'SimCheck2026!',
            device_name: 'stock_checker'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log("Success login:", res.data);
    } catch (e) {
        console.log("Error login:", e.response?.data);
    }
}

test();
