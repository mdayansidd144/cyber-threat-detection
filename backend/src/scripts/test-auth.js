const axios = require('axios');
const BASE_URL = 'http://localhost:5000';
async function testAuth() {
    console.log('Testing Authentication System...\n');

    try {
        console.log('Testing Registration...');
        const registerData = {
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        };

        const registerResponse = await axios.post(
            `${BASE_URL}/api/auth/register`,
            registerData
        );

        console.log('Registration Successful!');
        console.log('User:', registerResponse.data.user);
        console.log('Token:', registerResponse.data.token.substring(0, 20) + '...\n');

        const token = registerResponse.data.token;
        console.log('Testing Login...');
        const loginData = {
            email: registerData.email,
            password: 'password123'
        };

        const loginResponse = await axios.post(
            `${BASE_URL}/api/auth/login`,
            loginData
        );

        console.log('Login Successful!');
        console.log('User:', loginResponse.data.user);
        console.log('Token:', loginResponse.data.token.substring(0, 20) + '...\n');

        // 3. Test Protected Route
        console.log('Testing Protected Route...');
        const meResponse = await axios.get(
            `${BASE_URL}/api/auth/me`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('Protected Route Access Successful!');
        console.log('User Data:', meResponse.data.user);

        console.log('\n  All tests passed!');

    } catch (error) {
        console.error('Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}
testAuth();