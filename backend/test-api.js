const axios = require('axios');
const BASE_URL = 'http://localhost:5000';
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};
console.log(colors.blue + '\n Starting API Tests...\n' + colors.reset);
async function runTests() {
    let token = null;
    try {
        console.log(colors.yellow + 'Test 1: Register User' + colors.reset);
        const registerData = {
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        };

        try {
            const registerRes = await axios.post(
                `${BASE_URL}/api/auth/register`,
                registerData
            );
            console.log(colors.green + 'Registration Successful!' + colors.reset);
            console.log('   User:', registerRes.data.user.username);
            console.log('   Email:', registerRes.data.user.email);
            token = registerRes.data.token;
            console.log('   Token:', token.substring(0, 30) + '...\n');
        } catch (error) {
            console.log(colors.red + 'Registration Failed:' + colors.reset);
            console.log('   Error:', error.response?.data?.message || error.message);
            console.log('');
        }
        console.log(colors.yellow + 'Test 2: Login' + colors.reset);
        try {
            const loginData = {
                email: registerData.email,
                password: 'password123'
            };
            const loginRes = await axios.post(
                `${BASE_URL}/api/auth/login`,
                loginData
            );
            console.log(colors.green + 'Login Successful!' + colors.reset);
            token = loginRes.data.token;
            console.log('   User:', loginRes.data.user.username);
            console.log('   Token:', token.substring(0, 30) + '...\n');
        } catch (error) {
            console.log(colors.red + 'Login Failed:' + colors.reset);
            console.log('   Error:', error.response?.data?.message || error.message);
            console.log('');
        }
        if (!token) {
            console.log(colors.red + 'No token available. Stopping tests.' + colors.reset);
            return;
        }
        console.log(colors.yellow + '👤 Test 3: Get Current User' + colors.reset);
        try {
            const meRes = await axios.get(
                `${BASE_URL}/api/auth/me`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(colors.green + 'Get User Successful!' + colors.reset);
            console.log('   User:', meRes.data.user.username);
            console.log('   Email:', meRes.data.user.email);
            console.log('   Role:', meRes.data.user.role);
            console.log('');
        } catch (error) {
            console.log(colors.red + 'Get User Failed:' + colors.reset);
            console.log('   Error:', error.response?.data?.message || error.message);
            console.log('');
        }
        console.log(colors.yellow + 'Test 4: Update Profile' + colors.reset);
        try {
            const updateData = {
                username: `updated_${Date.now()}`,
                email: `updated_${Date.now()}@example.com`
            };
            const updateRes = await axios.put(
                `${BASE_URL}/api/auth/update-profile`,
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log(colors.green + 'Update Successful!' + colors.reset);
            console.log('   New Username:', updateRes.data.user.username);
            console.log('   New Email:', updateRes.data.user.email);
            console.log('');
        } catch (error) {
            console.log(colors.red + 'Update Failed:' + colors.reset);
            console.log('   Error:', error.response?.data?.message || error.message);
            console.log('');
        }
        console.log(colors.yellow + 'Test 5: Logout' + colors.reset);
        try {
            await axios.post(
                `${BASE_URL}/api/auth/logout`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(colors.green + 'Logout Successful!' + colors.reset);
            console.log('');
        } catch (error) {
            console.log(colors.red + 'Logout Failed:' + colors.reset);
            console.log('   Error:', error.response?.data?.message || error.message);
            console.log('');
        }
        console.log(colors.yellow + 'Test 6: Access Without Token (Should Fail)' + colors.reset);
        try {
            await axios.get(`${BASE_URL}/api/auth/me`);
            console.log(colors.red + 'This should have failed!' + colors.reset);
        } catch (error) {
            console.log(colors.green + 'Correctly blocked!' + colors.reset);
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.message || error.message);
            console.log('');
        }

        console.log(colors.blue + 'All tests completed!' + colors.reset);
    } catch (error) {
        console.error(colors.red + 'Test Error:' + colors.reset, error.message);
    }
}
runTests();