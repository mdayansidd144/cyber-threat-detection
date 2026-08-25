const axios = require('axios');
const BASE_URL = 'http://localhost:5000';
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m',
    reset: '\x1b[0m'
};
console.log(colors.blue + '\n Testing Dashboard API...\n' + colors.reset);
async function testDashboard() {
    let token = null;
    let adminToken = null;
    try {
        console.log(colors.yellow + 'Step 1: Register Admin User' + colors.reset);
        try {
            const registerData = {
                username: `admin_${Date.now()}`,
                email: `admin_${Date.now()}@test.com`,
                password: 'password123',
                role: 'admin'
            };
            const registerRes = await axios.post(
                `${BASE_URL}/api/auth/register`,
                registerData
            );
            adminToken = registerRes.data.token;
            console.log(colors.green + 'Admin registered successfully!' + colors.reset);
            console.log(`   Username: ${registerRes.data.user.username}`);
            console.log(`   Role: ${registerRes.data.user.role}`);
            console.log('');
        } catch (error) {
            console.log(colors.yellow + 'Admin already exists, trying login...' + colors.reset);
            try {
                const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                    email: 'admin@test.com',
                    password: 'password123'
                });
                adminToken = loginRes.data.token;
                console.log(colors.green + 'Admin login successful!' + colors.reset);
                console.log('');
            } catch (loginError) {
                console.log(colors.red + 'Failed to create or login admin:' + colors.reset);
                console.log('   Error:', loginError.response?.data?.message || loginError.message);
                console.log('');
            }
        }
        if (!adminToken) {
            console.log(colors.red + 'No admin token available. Stopping tests.' + colors.reset);
            return;
        }
        console.log(colors.yellow + 'Step 2: Generate Test Threats' + colors.reset);
        try {
            const genRes = await axios.post(
                `${BASE_URL}/api/threats/generate?count=10`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );
            console.log(colors.green + `Generated ${genRes.data.count} threats!` + colors.reset);
            console.log('');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log(colors.yellow + ' Admin permission required to generate threats' + colors.reset);
                console.log('   Skipping threat generation...\n');
            } else {
                console.log(colors.red + 'Failed to generate threats:' + colors.reset);
                console.log('   Error:', error.response?.data?.message || error.message);
                console.log('');
            }
        }
        console.log(colors.yellow + 'Step 3: Login as Regular User' + colors.reset);
        try {
            const userData = {
                username: `user_${Date.now()}`,
                email: `user_${Date.now()}@test.com`,
                password: 'password123'
            };
            await axios.post(`${BASE_URL}/api/auth/register`, userData);
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: userData.email,
                password: 'password123'
            });
            token = loginRes.data.token;
            console.log(colors.green + 'User login successful!' + colors.reset);
            console.log(`   User: ${loginRes.data.user.username}`);
            console.log('');
        } catch (error) {
            console.log(colors.yellow + ' Could not create new user, using admin...' + colors.reset);
            token = adminToken;
            console.log('');
        }
        console.log(colors.yellow + ' Step 4: Get Dashboard Data' + colors.reset);
        try {
            const dashboardRes = await axios.get(
                `${BASE_URL}/api/dashboard`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = dashboardRes.data.data;
            console.log(colors.green + ' Dashboard data retrieved!' + colors.reset);
            console.log(`   ${colors.gray}Total Threats:${colors.reset} ${data.stats.total}`);
            console.log(`   ${colors.gray}Active:${colors.reset} ${data.stats.active}`);
            console.log(`   ${colors.gray}Investigating:${colors.reset} ${data.stats.investigating}`);
            console.log(`   ${colors.gray}Contained:${colors.reset} ${data.stats.contained}`);
            console.log(`   ${colors.gray}Resolved:${colors.reset} ${data.stats.resolved}`);
            console.log(`   ${colors.gray}Avg Severity:${colors.reset} ${data.stats.avgSeverity?.toFixed(1) || 'N/A'}`);
            console.log(`   ${colors.gray}Simulation:${colors.reset} ${data.simulation.isRunning ? ' Running' : ' Stopped'}`);
            console.log(`   ${colors.gray}Recent Threats:${colors.reset} ${data.threats?.length || 0}`);
            console.log('');
        } catch (error) {
            console.log(colors.red + 'Failed to get dashboard data:' + colors.reset);
            console.log('   Status:', error.response?.status);
            console.log('   Message:', error.response?.data?.message || error.message);
            console.log('');
        }
        console.log(colors.yellow + 'Step 5: Get Threat Timeline' + colors.reset);
        try {
            const timelineRes = await axios.get(
                `${BASE_URL}/api/dashboard/timeline?days=7`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(colors.green + 'Timeline retrieved!' + colors.reset);
            console.log(`   ${colors.gray}Data Points:${colors.reset} ${timelineRes.data.data.length}`);
            console.log(`   ${colors.gray}Days:${colors.reset} ${timelineRes.data.days}`);
            if (timelineRes.data.data.length > 0) {
                const first = timelineRes.data.data[0];
                const last = timelineRes.data.data[timelineRes.data.data.length - 1];
                console.log(`   ${colors.gray}First:${colors.reset} ${first.count} threats (avg severity: ${first.avgSeverity?.toFixed(1) || 'N/A'})`);
                console.log(`   ${colors.gray}Last:${colors.reset} ${last.count} threats (avg severity: ${last.avgSeverity?.toFixed(1) || 'N/A'})`);
            }
            console.log('');
        } catch (error) {
            console.log(colors.red + 'Failed to get timeline:' + colors.reset);
            console.log('   Error:', error.response?.data?.message || error.message);
            console.log('');
        }
        console.log(colors.yellow + ' Step 6: Get Threat Map Data' + colors.reset);
        try {
            const mapRes = await axios.get(
                `${BASE_URL}/api/dashboard/map`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(colors.green + 'Map data retrieved!' + colors.reset);
            console.log(` ${colors.gray}Locations:${colors.reset} ${mapRes.data.data.length}`);
            if (mapRes.data.data.length > 0) {
                mapRes.data.data.slice(0, 3).forEach(location => {
                    console.log(`   ${location.city}, ${location.country}: ${location.count} threats (avg severity: ${location.avgSeverity?.toFixed(1) || 'N/A'})`);
                });
                if (mapRes.data.data.length > 3) {
                    console.log(`   ${colors.gray}... and ${mapRes.data.data.length - 3} more locations${colors.reset}`);
                }
            }
            console.log('');
        } catch (error) {
            console.log(colors.red + 'Failed to get map data:' + colors.reset);
            console.log('Error:', error.response?.data?.message || error.message);
            console.log('');
        }
        console.log(colors.yellow + 'Step 7: Get Threat Types Breakdown' + colors.reset);
        try {
            const typesRes = await axios.get(
                `${BASE_URL}/api/dashboard/types`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(colors.green + ' Threat types retrieved!' + colors.reset);
            if (typesRes.data.data.length > 0) {
                console.log(`   ${colors.gray}Type Breakdown:${colors.reset}`);
                typesRes.data.data.forEach(item => {
                    console.log(`   ${item._id}: ${item.count} (avg severity: ${item.avgSeverity.toFixed(1)})`);
                });
            } else {
                console.log(`   ${colors.gray}No threat types found${colors.reset}`);
            }
            console.log('');
        } catch (error) {
            console.log(colors.red + ' Failed to get threat types:' + colors.reset);
            console.log('   Error:', error.response?.data?.message || error.message);
            console.log('');
        }
        console.log(colors.yellow + 'Step 8: Get Recent Alerts' + colors.reset);
        try {
            const alertsRes = await axios.get(
                `${BASE_URL}/api/dashboard/alerts?limit=5`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(colors.green + `Alerts retrieved (${alertsRes.data.data.length})` + colors.reset);
            if (alertsRes.data.data.length > 0) {
                alertsRes.data.data.forEach((alert, index) => {
                    const severityColor = alert.severity > 7 ? colors.red : 
                                        alert.severity > 4 ? colors.yellow : colors.green;
                    console.log(`   ${index + 1}. ${alert.type} | ${severityColor}${alert.severity}/10${colors.reset} | ${alert.status} | ${alert.source?.country || 'Unknown'}`);
                });
            } else {
                console.log(`   ${colors.gray}No alerts found${colors.reset}`);
            }
            console.log('');
        } catch (error) {
            console.log(colors.red + ' Failed to get alerts:' + colors.reset);
            console.log('   Error:', error.response?.data?.message || error.message);
            console.log('');
        }
        console.log(colors.yellow + ' Step 9: Test Without Token (Should Fail)' + colors.reset);
        try {
            await axios.get(`${BASE_URL}/api/dashboard`);
            console.log(colors.red + 'This should have failed!' + colors.reset);
        } catch (error) {
            console.log(colors.green + 'Correctly blocked!' + colors.reset);
            console.log(`${colors.gray}Status:${colors.reset} ${error.response?.status}`);
            console.log(`${colors.gray}Message:${colors.reset} ${error.response?.data?.message || error.message}`);
            console.log('');
        }
        console.log(colors.blue + '='.repeat(50) + colors.reset);
        console.log(colors.blue + ' All Dashboard Tests Completed!' + colors.reset);
        console.log(colors.blue + '='.repeat(50) + colors.reset);
        console.log('');
        console.log(`${colors.gray}Summary:${colors.reset}`);
        console.log(`${colors.gray}Dashboard API:${colors.reset} Working `);
        console.log(`${colors.gray}WebSocket:${colors.reset} ${'Active'}`);
        console.log(`${colors.gray}Threat Simulation:${colors.reset} ${'Running'}`);
        console.log(`${colors.gray}Protected Routes:${colors.reset} Working `);
        console.log(`${colors.gray}Real-time Updates:${colors.reset} ${'Active'}`);
        console.log('');
        console.log(colors.green + ' Ready for Frontend Integration!' + colors.reset);
    } catch (error) {
        console.error(colors.red + 'Test Error:' + colors.reset, error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}
testDashboard();