const fs = require('fs');
const path = require('path');

const JSON_DB_PATH = path.join(__dirname, 'users.json');

// Pre-seed mock user data if file doesn't exist
if (!fs.existsSync(JSON_DB_PATH)) {
  const seedUsers = [
    {
      id: 1,
      name: "System Admin",
      email: "admin@productsphere.com",
      password: "adminpassword", // Plaintext for easy initial demo; in real signup we hash using bcrypt
      role: "admin",
      phone: "03001234567",
      gender: "male",
      status: "approved",
      license_no: null,
      business_address: null
    },
    {
      id: 2,
      name: "Wholesaler User",
      email: "wholesaler@productsphere.com",
      password: "wholesalerpassword",
      role: "wholesaler",
      phone: "03007654321",
      gender: "male",
      status: "approved",
      license_no: "TX-998827-B",
      business_address: "Karkhana Bazar, Faisalabad, Punjab"
    },
    {
      id: 3,
      name: "Buyer User",
      email: "buyer@productsphere.com",
      password: "buyerpassword",
      role: "buyer",
      phone: "03211234567",
      gender: "female",
      status: "approved",
      license_no: null,
      business_address: null
    }
  ];
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(seedUsers, null, 2));
}

// Mock database pool that intercepts simple SELECT and INSERT SQL queries
const db = {
  query: async (sql, params) => {
    try {
      const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
      const users = JSON.parse(data);

      const queryNormalized = sql.trim().toLowerCase();

      if (queryNormalized.startsWith('select')) {
        // Check if filtering by role and status (e.g. for pending approval list)
        if (queryNormalized.includes('role =') && queryNormalized.includes('status =')) {
          const roleParam = params[0].toLowerCase();
          const statusParam = params[1].toLowerCase();
          const matched = users.filter(u => 
            u.role.toLowerCase() === roleParam && 
            (u.status || 'approved').toLowerCase() === statusParam
          );
          return [matched];
        }

        // Example: SELECT id, name, email, password, role, phone, gender, status, license_no, business_address FROM users WHERE email = ?
        const emailParam = params[0].toLowerCase();
        const matchedUser = users.find(u => u.email.toLowerCase() === emailParam);
        return [matchedUser ? [matchedUser] : []];
      } 
      
      if (queryNormalized.startsWith('insert')) {
        // Example: INSERT INTO users (name, phone, gender, email, password, role, status, license_no, business_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        const [name, phone, gender, email, password, role, status, license_no, business_address] = params;
        const newUser = {
          id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
          name,
          phone: phone || null,
          gender: gender || 'male',
          email,
          password,
          role: role || 'buyer',
          status: status || (role === 'wholesaler' ? 'pending' : 'approved'),
          license_no: license_no || null,
          business_address: business_address || null
        };
        users.push(newUser);
        fs.writeFileSync(JSON_DB_PATH, JSON.stringify(users, null, 2));
        return [{ insertId: newUser.id }];
      }

      if (queryNormalized.startsWith('update')) {
        // Example: UPDATE users SET status = ? WHERE id = ?
        const [status, id] = params;
        const userIndex = users.findIndex(u => u.id === parseInt(id));
        if (userIndex !== -1) {
          users[userIndex].status = status;
          fs.writeFileSync(JSON_DB_PATH, JSON.stringify(users, null, 2));
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }

      return [[]];
    } catch (err) {
      console.error("Mock DB error:", err);
      throw err;
    }
  }
};

module.exports = db;
