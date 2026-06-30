const fs = require('fs');
const path = require('path');

const JSON_DB_PATH = path.join(__dirname, 'users.json');
<<<<<<< HEAD
const PRODUCTS_DB_PATH = path.join(__dirname, 'products.json');
const CATEGORIES_DB_PATH = path.join(__dirname, 'categories.json');
=======
>>>>>>> 9a72b4dffa84106cb2dc26cbb7a226674300486e

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

<<<<<<< HEAD
// Mock database pool that intercepts simple SELECT, INSERT, UPDATE, and DELETE SQL queries
const db = {
  query: async (sql, params) => {
    try {
      const queryNormalized = sql.trim().toLowerCase();
      
      let dbPath = JSON_DB_PATH;
      let isProductQuery = false;
      let isCategoryQuery = false;

      if (queryNormalized.includes('products')) {
        dbPath = PRODUCTS_DB_PATH;
        isProductQuery = true;
      } else if (queryNormalized.includes('categories')) {
        dbPath = CATEGORIES_DB_PATH;
        isCategoryQuery = true;
      }

      // Ensure file exists
      if (isProductQuery && !fs.existsSync(PRODUCTS_DB_PATH)) {
        fs.writeFileSync(PRODUCTS_DB_PATH, JSON.stringify([], null, 2));
      }
      if (isCategoryQuery && !fs.existsSync(CATEGORIES_DB_PATH)) {
        fs.writeFileSync(CATEGORIES_DB_PATH, JSON.stringify([], null, 2));
      }

      const data = fs.readFileSync(dbPath, 'utf8');
      const items = JSON.parse(data);

      if (queryNormalized.startsWith('select')) {
        if (isProductQuery) {
          // Check if selecting wholesaler-specific catalog
          if (queryNormalized.includes('wholesaler_id =') || queryNormalized.includes('wholesaler_id=')) {
            const wholesalerId = params[0];
            const matched = items.filter(p => p.wholesaler_id === parseInt(wholesalerId));
            return [matched];
          }
          return [items];
        } else if (isCategoryQuery) {
          return [items];
        } else {
          // Check if filtering by role and status (e.g. for pending approval list)
          if (queryNormalized.includes('role =') && queryNormalized.includes('status =')) {
            const roleParam = params[0].toLowerCase();
            const statusParam = params[1].toLowerCase();
            const matched = items.filter(u => 
              u.role.toLowerCase() === roleParam && 
              (u.status || 'approved').toLowerCase() === statusParam
            );
            return [matched];
          }

          // Example: SELECT id, name, email, password, role, phone, gender, status, license_no, business_address FROM users WHERE email = ?
          const emailParam = params[0].toLowerCase();
          const matchedUser = items.find(u => u.email.toLowerCase() === emailParam);
          return [matchedUser ? [matchedUser] : []];
        }
      } 
      
      if (queryNormalized.startsWith('insert')) {
        if (isProductQuery) {
          // Example: INSERT INTO products (name, description, price, original_price, quantity, category, wholesaler_id, wholesaler_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          const [name, description, price, original_price, quantity, category, wholesaler_id, wholesaler_name, status] = params;
          const newProduct = {
            id: items.length > 0 ? Math.max(...items.map(p => p.id)) + 1 : 1,
            name,
            description: description || null,
            price: Number(price),
            original_price: Number(original_price),
            quantity: Number(quantity || 1),
            category,
            wholesaler_id: Number(wholesaler_id),
            wholesaler_name,
            status: status || 'active'
          };
          items.push(newProduct);
          fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
          return [{ insertId: newProduct.id }];
        } else if (isCategoryQuery) {
          // Example: INSERT INTO categories (name, description) VALUES (?, ?)
          const [name, description] = params;
          const existing = items.find(c => c.name.toLowerCase() === name.toLowerCase());
          if (existing) {
            throw new Error("Category already exists");
          }
          const newCategory = {
            id: items.length > 0 ? Math.max(...items.map(c => c.id)) + 1 : 1,
            name,
            description: description || null
          };
          items.push(newCategory);
          fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
          return [{ insertId: newCategory.id }];
        } else {
          // Example: INSERT INTO users (name, phone, gender, email, password, role, status, license_no, business_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          const [name, phone, gender, email, password, role, status, license_no, business_address] = params;
          const newUser = {
            id: items.length > 0 ? Math.max(...items.map(u => u.id)) + 1 : 1,
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
          items.push(newUser);
          fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
          return [{ insertId: newUser.id }];
        }
      }

      if (queryNormalized.startsWith('update')) {
        if (isProductQuery) {
          if (queryNormalized.includes('status =') || queryNormalized.includes('status=')) {
            // Example: UPDATE products SET status = ? WHERE id = ?
            const [status, id] = params;
            const idx = items.findIndex(p => p.id === parseInt(id));
            if (idx !== -1) {
              items[idx].status = status;
              fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
              return [{ affectedRows: 1 }];
            }
          } else {
            // Example: UPDATE products SET name = ?, description = ?, price = ?, original_price = ?, quantity = ?, category = ? WHERE id = ?
            const [name, description, price, original_price, quantity, category, id] = params;
            const idx = items.findIndex(p => p.id === parseInt(id));
            if (idx !== -1) {
              items[idx].name = name;
              items[idx].description = description || null;
              items[idx].price = Number(price);
              items[idx].original_price = Number(original_price);
              items[idx].quantity = Number(quantity || 1);
              items[idx].category = category;
              fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
              return [{ affectedRows: 1 }];
            }
          }
          return [{ affectedRows: 0 }];
        } else if (isCategoryQuery) {
          // Example: UPDATE categories SET name = ?, description = ? WHERE id = ?
          const [name, description, id] = params;
          const idx = items.findIndex(c => c.id === parseInt(id));
          if (idx !== -1) {
            items[idx].name = name;
            items[idx].description = description || null;
            fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
            return [{ affectedRows: 1 }];
          }
          return [{ affectedRows: 0 }];
        } else {
          // Example: UPDATE users SET status = ? WHERE id = ?
          const [status, id] = params;
          const userIndex = items.findIndex(u => u.id === parseInt(id));
          if (userIndex !== -1) {
            items[userIndex].status = status;
            fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
            return [{ affectedRows: 1 }];
          }
          return [{ affectedRows: 0 }];
        }
      }

      if (queryNormalized.startsWith('delete')) {
        if (isProductQuery) {
          // Example: DELETE FROM products WHERE id = ?
          const id = params[0];
          const filtered = items.filter(p => p.id !== parseInt(id));
          fs.writeFileSync(dbPath, JSON.stringify(filtered, null, 2));
          return [{ affectedRows: 1 }];
        } else if (isCategoryQuery) {
          // Example: DELETE FROM categories WHERE id = ?
          const id = params[0];
          const filtered = items.filter(c => c.id !== parseInt(id));
          fs.writeFileSync(dbPath, JSON.stringify(filtered, null, 2));
          return [{ affectedRows: 1 }];
        }
=======
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
>>>>>>> 9a72b4dffa84106cb2dc26cbb7a226674300486e
      }

      return [[]];
    } catch (err) {
      console.error("Mock DB error:", err);
      throw err;
    }
  }
};

module.exports = db;
