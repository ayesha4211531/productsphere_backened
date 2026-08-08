const fs = require('fs');
const path = require('path');

const JSON_DB_PATH = path.join(__dirname, 'users.json');
const PRODUCTS_DB_PATH = path.join(__dirname, 'products.json');
const CATEGORIES_DB_PATH = path.join(__dirname, 'categories.json');
const ORDERS_DB_PATH = path.join(__dirname, 'orders.json');
const NEGOTIATIONS_DB_PATH = path.join(__dirname, 'negotiations.json');
const SETTINGS_DB_PATH = path.join(__dirname, 'settings.json');

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

// Mock database pool that intercepts simple SELECT, INSERT, UPDATE, and DELETE SQL queries
const db = {
  query: async (sql, params) => {
    try {
      const queryNormalized = sql.trim().toLowerCase();
      
      let dbPath = JSON_DB_PATH;
      let isProductQuery = false;
      let isCategoryQuery = false;
      let isOrderQuery = false;
      let isNegotiationQuery = false;
      let isSettingsQuery = false;

      if (queryNormalized.includes('products')) {
        dbPath = PRODUCTS_DB_PATH;
        isProductQuery = true;
      } else if (queryNormalized.includes('categories')) {
        dbPath = CATEGORIES_DB_PATH;
        isCategoryQuery = true;
      } else if (queryNormalized.includes('orders')) {
        dbPath = ORDERS_DB_PATH;
        isOrderQuery = true;
      } else if (queryNormalized.includes('negotiations')) {
        dbPath = NEGOTIATIONS_DB_PATH;
        isNegotiationQuery = true;
      } else if (queryNormalized.includes('system_settings') || queryNormalized.includes('settings')) {
        dbPath = SETTINGS_DB_PATH;
        isSettingsQuery = true;
      }

      // Ensure file exists
      if (isProductQuery && !fs.existsSync(PRODUCTS_DB_PATH)) {
        fs.writeFileSync(PRODUCTS_DB_PATH, JSON.stringify([], null, 2));
      }
      if (isCategoryQuery && !fs.existsSync(CATEGORIES_DB_PATH)) {
        fs.writeFileSync(CATEGORIES_DB_PATH, JSON.stringify([], null, 2));
      }
      if (isOrderQuery && !fs.existsSync(ORDERS_DB_PATH)) {
        fs.writeFileSync(ORDERS_DB_PATH, JSON.stringify([], null, 2));
      }
      if (isNegotiationQuery && !fs.existsSync(NEGOTIATIONS_DB_PATH)) {
        fs.writeFileSync(NEGOTIATIONS_DB_PATH, JSON.stringify([], null, 2));
      }
      if (isSettingsQuery && !fs.existsSync(SETTINGS_DB_PATH)) {
        const seedSettings = [
          { key: 'platform_name', value: 'Product Sphere' },
          { key: 'contact_email', value: 'support@productsphere.com' },
          { key: 'commission_percent', value: '5' },
          { key: 'max_negotiation_rounds', value: '3' },
          { key: 'maintenance_mode', value: 'false' },
          { key: 'allow_buyer_registration', value: 'true' },
          { key: 'allow_wholesaler_registration', value: 'true' }
        ];
        fs.writeFileSync(SETTINGS_DB_PATH, JSON.stringify(seedSettings, null, 2));
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
        } else if (isOrderQuery) {
          if (queryNormalized.includes('buyer_id =') || queryNormalized.includes('buyer_id=')) {
            const buyerId = params[0];
            const matched = items.filter(o => o.buyer_id === parseInt(buyerId));
            return [matched];
          }
          return [items];
        } else if (isNegotiationQuery) {
          if (queryNormalized.includes('buyer_id =') || queryNormalized.includes('buyer_id=')) {
            const buyerId = params[0];
            const matched = items.filter(n => n.buyer_id === parseInt(buyerId));
            return [matched];
          }
          if (queryNormalized.includes('wholesaler_id =') || queryNormalized.includes('wholesaler_id=')) {
            const wholesalerId = params[0];
            const matched = items.filter(n => n.wholesaler_id === parseInt(wholesalerId));
            return [matched];
          }
          return [items];
        } else if (isSettingsQuery) {
          return [items];
        } else {
          // Check if filtering by role only (e.g. SELECT ... WHERE role = ?)
          if (queryNormalized.includes('role =') && !queryNormalized.includes('status =')) {
            const roleParam = params[0].toLowerCase();
            const matched = items.filter(u => u.role.toLowerCase() === roleParam);
            return [matched];
          }

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
          // INSERT INTO products (name, description, price, original_price, quantity, category, wholesaler_id, wholesaler_name, status, product_image)
          const [name, description, price, original_price, quantity, category, wholesaler_id, wholesaler_name, status, product_image] = params;
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
            status: status || 'active',
            product_image: product_image || null
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
        } else if (isOrderQuery) {
          // INSERT INTO orders (buyer_id, buyer_name, shipping_address, phone, payment_method, payment_status, status, items, total_amount, payment_proof)
          const [buyer_id, buyer_name, shipping_address, phone, payment_method, payment_status, status, itemsStr, total_amount, payment_proof] = params;
          const newOrder = {
            id: items.length > 0 ? Math.max(...items.map(o => o.id)) + 1 : 1,
            buyer_id: Number(buyer_id),
            buyer_name,
            shipping_address,
            phone,
            payment_method,
            payment_status: payment_status || 'pending',
            status: status || 'pending',
            items: typeof itemsStr === 'string' ? JSON.parse(itemsStr) : itemsStr,
            total_amount: Number(total_amount),
            payment_proof: payment_proof || null,
            created_at: new Date().toISOString()
          };
          items.push(newOrder);
          fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
          return [{ insertId: newOrder.id }];
        } else if (isNegotiationQuery) {
          // Example: INSERT INTO negotiations (buyer_id, buyer_name, product_id, product_name, price, quantity, bid_price, status, message, wholesaler_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          const [buyer_id, buyer_name, product_id, product_name, price, quantity, bid_price, status, message, wholesaler_id] = params;
          const newBid = {
            id: items.length > 0 ? Math.max(...items.map(n => n.id)) + 1 : 1,
            buyer_id: Number(buyer_id),
            buyer_name,
            product_id: Number(product_id),
            product_name,
            price: Number(price),
            quantity: Number(quantity),
            bid_price: Number(bid_price),
            status: status || 'pending',
            message: message || null,
            wholesaler_id: Number(wholesaler_id),
            created_at: new Date().toISOString()
          };
          items.push(newBid);
          fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
          return [{ insertId: newBid.id }];
        } else if (isSettingsQuery) {
          const [key, value] = params;
          const idx = items.findIndex(s => s.key === key);
          if (idx !== -1) {
            items[idx].value = String(value);
          } else {
            items.push({ key, value: String(value) });
          }
          fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
          return [{ affectedRows: 1 }];
        } else {
          // INSERT INTO users ... (name, phone, gender, email, password, role, status, license_no, business_address, shop_picture, cnic_front, cnic_back)
          const [name, phone, gender, email, password, role, status, license_no, business_address, shop_picture, cnic_front, cnic_back] = params;
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
            business_address: business_address || null,
            shop_picture: shop_picture || null,
            cnic_front: cnic_front || null,
            cnic_back: cnic_back || null
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
            // UPDATE products SET name = ?, description = ?, price = ?, original_price = ?, quantity = ?, category = ?, product_image = ? WHERE id = ?
            const [name, description, price, original_price, quantity, category, product_image, id] = params;
            const idx = items.findIndex(p => p.id === parseInt(id));
            if (idx !== -1) {
              items[idx].name = name;
              items[idx].description = description || null;
              items[idx].price = Number(price);
              items[idx].original_price = Number(original_price);
              items[idx].quantity = Number(quantity || 1);
              items[idx].category = category;
              items[idx].product_image = product_image !== undefined ? product_image : (items[idx].product_image || null);
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
        } else if (isNegotiationQuery) {
          // Example: UPDATE negotiations SET status = ? WHERE id = ?
          const [status, id] = params;
          const idx = items.findIndex(n => n.id === parseInt(id));
          if (idx !== -1) {
            items[idx].status = status;
            fs.writeFileSync(dbPath, JSON.stringify(items, null, 2));
            return [{ affectedRows: 1 }];
          }
          return [{ affectedRows: 0 }];
        } else if (isOrderQuery) {
          // Example: UPDATE orders SET status = ? WHERE id = ?
          const [status, id] = params;
          const idx = items.findIndex(o => o.id === parseInt(id));
          if (idx !== -1) {
            items[idx].status = status;
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
      }

      return [[]];
    } catch (err) {
      console.error("Mock DB error:", err);
      throw err;
    }
  }
};

module.exports = db;