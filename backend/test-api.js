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
    let threatId = null;

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
        console.log(colors.yellow + 'Test 3: Get Current User' + colors.reset);
        try {
            const meRes = await axios.get(
                `${BASE_URL}/api/auth/me`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(colors.green + ' Get User Successful!' + colors.reset);
            console.log('   User:', meRes.data.user.username);
            console.log('   Email:', meRes.data.user.email);
            console.log('   Role:', meRes.data.user.role);
            console.log('');
        } catch (error) {
            console.log(colors.red + ' Get User Failed:' + colors.reset);
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
            console.log(colors.green + ' Update Successful!' + colors.reset);
            console.log('   New Username:', updateRes.data.user.username);
            console.log('   New Email:', updateRes.data.user.email);
            console.log('');
        } catch (error) {
            console.log(colors.red + ' Update Failed:' + colors.reset);
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
            console.log(colors.green + ' Logout Successful!' + colors.reset);
            console.log('');
        } catch (error) {
            console.log(colors.red + 'Logout Failed:' + colors.reset);
            console.log('   Error:', error.response?.data?.message || error.message);
            console.log('');
        }

        console.log(colors.yellow + 'Test 6: Access Without Token (Should Fail)' + colors.reset);
        try {
            await axios.get(`${BASE_URL}/api/auth/me`);
            console.log(colors.red + ' This should have failed!' + colors.reset);
        } catch (error) {
            console.log(colors.green + 'Correctly blocked!' + colors.reset);
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.message || error.message);
            console.log('');
        }

        console.log(colors.yellow + ' Test 7: Generate Threats (Admin Only)' + colors.reset);
        try {
            const genRes = await axios.post(
                `${BASE_URL}/api/threats/generate?count=3`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(colors.green + 'Threats Generated!' + colors.reset);
            console.log('   Count:', genRes.data.count);
            console.log('');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log(colors.yellow + ' Requires admin role (403 Forbidden)' + colors.reset);
                console.log('   Regular users cannot generate threats\n');
            } else {
                console.log(colors.red + 'Generate Threats Failed:' + colors.reset);
                console.log('   Error:', error.response?.data?.message || error.message);
                console.log('');
            }
        }
        console.log(colors.yellow + 'Test 8: Get All Threats' + colors.reset);
        try {
            const threatsRes = await axios.get(
                `${BASE_URL}/api/threats`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(colors.green + 'Threats Retrieved!' + colors.reset);
            console.log('   Total:', threatsRes.data.total);
            console.log('   Page:', threatsRes.data.page);
            console.log('   Total Pages:', threatsRes.data.totalPages);
            
            if (threatsRes.data.threats && threatsRes.data.threats.length > 0) {
                const threat = threatsRes.data.threats[0];
                threatId = threat._id;
                console.log('Sample Threat:');
                console.log(`Type: ${threat.type}`);
                console.log(`Severity: ${threat.severity}/10`);
                console.log(`Status: ${threat.status}`);
                console.log(`Source: ${threat.source.ip} (${threat.source.country})`);
            }
            console.log('');
        } catch (error) {
            console.log(colors.red + ' Get Threats Failed:' + colors.reset);
            console.log('Error:', error.response?.data?.message || error.message);
            console.log('');
        }

        console.log(colors.yellow + 'Test 9: Get Threat Statistics' + colors.reset);
        try {
            const statsRes = await axios.get(
                `${BASE_URL}/api/threats/stats`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(colors.green + 'Statistics Retrieved!' + colors.reset);
            const stats = statsRes.data.stats;
            console.log('Total Threats:', stats.total);
            console.log('Active:', stats.active);
            console.log('Investigating:', stats.investigating);
            console.log('Contained:', stats.contained);
            console.log('Resolved:', stats.resolved);
            console.log('Avg Severity:', stats.avgSeverity?.toFixed(1) || 'N/A');
            
            if (statsRes.data.byType && statsRes.data.byType.length > 0) {
                console.log('   Top Threat Types:');
                statsRes.data.byType.slice(0, 3).forEach(item => {
                    console.log(`      ${item._id}: ${item.count} (avg severity: ${item.avgSeverity.toFixed(1)})`);
                });
            }
            console.log('');
        } catch (error) {
            console.log(colors.red + 'Get Statistics Failed:' + colors.reset);
            console.log('   Error:', error.response?.data?.message || error.message);
            console.log('');
        }

        if (threatId) {
            console.log(colors.yellow + 'Test 10: Get Single Threat' + colors.reset);
            try {
                const threatRes = await axios.get(
                    `${BASE_URL}/api/threats/${threatId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                console.log(colors.green + 'Threat Retrieved!' + colors.reset);
                console.log('ID:', threatRes.data.threat._id);
                console.log('Type:', threatRes.data.threat.type);
                console.log('Severity:', threatRes.data.threat.severity);
                console.log('Status:', threatRes.data.threat.status);
                console.log('Description:', threatRes.data.threat.description);
                console.log('Confidence:', threatRes.data.threat.confidence + '%');
                console.log('Mitigation Steps:', threatRes.data.threat.mitigation?.steps?.length || 0);
                console.log('');
            } catch (error) {
                console.log(colors.red + 'Get Threat Failed:' + colors.reset);
                console.log('Error:', error.response?.data?.message || error.message);
                console.log('');
            }

            console.log(colors.yellow + 'Test 11: Update Threat Status' + colors.reset);
            try {
                const updateRes = await axios.put(
                    `${BASE_URL}/api/threats/${threatId}/status`,
                    { status: 'investigating' },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(colors.green + 'Status Updated!' + colors.reset);
                console.log('   New Status:', updateRes.data.threat.status);
                console.log('');
            } catch (error) {
                console.log(colors.red + 'Update Status Failed:' + colors.reset);
                console.log('   Error:', error.response?.data?.message || error.message);
                console.log('');
            }

            console.log(colors.yellow + 'Test 12: Add Mitigation Step' + colors.reset);
            try {
                const stepRes = await axios.post(
                    `${BASE_URL}/api/threats/${threatId}/mitigation`,
                    { step: 'Run antivirus scan on affected system' },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(colors.green + 'Mitigation Step Added!' + colors.reset);
                console.log('Steps:', stepRes.data.threat.mitigation.steps);
                console.log('');
            } catch (error) {
                console.log(colors.red + 'Add Mitigation Failed:' + colors.reset);
                console.log('Error:', error.response?.data?.message || error.message);
                console.log('');
            }
        }
        console.log(colors.blue + 'All tests completed!' + colors.reset);
    } catch (error) {
        console.error(colors.red + 'Test Error:' + colors.reset, error.message);
    }
}
runTests();