// Global Variables
let sqlHistory = [];
let currentSQL = '';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Set up navigation
    setupNavigation();
    
    // Load initial data
    loadDashboardData();
    
    // Set up form handlers
    setupFormHandlers();
    
    // Initialize SQL dialog
    initializeSQLDialog();
    
    console.log('Application initialized');
}

// Navigation Setup
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active button
            navButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        
        // Load data for the section
        switch(sectionId) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'products':
                loadProducts();
                loadCategoriesForSelect();
                loadSuppliersForSelect();
                break;
            case 'inventory':
                loadInventory();
                loadProductsForSelect();
                loadWarehousesForSelect();
                break;
            case 'suppliers':
                loadSuppliers();
                break;
            case 'purchase-orders':
                loadPurchaseOrders();
                loadSuppliersForSelect();
                break;
            case 'transactions':
                loadTransactions();
                loadProductsForSelect();
                loadWarehousesForSelect();
                break;
        }
    }
}

// Form Handlers Setup
function setupFormHandlers() {
    // Product Form
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Supplier Form
    const supplierForm = document.getElementById('supplier-form');
    if (supplierForm) {
        supplierForm.addEventListener('submit', handleSupplierSubmit);
    }
    
    // Purchase Order Form
    const poForm = document.getElementById('po-form');
    if (poForm) {
        poForm.addEventListener('submit', handlePOSubmit);
    }
    
    // Transaction Form
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
    }
    
    // Adjustment Form
    const adjustmentForm = document.getElementById('adjustment-form');
    if (adjustmentForm) {
        adjustmentForm.addEventListener('submit', handleAdjustmentSubmit);
        
        // Add event listeners for product/warehouse selection
        const productSelect = document.getElementById('adjustment-product-select');
        const warehouseSelect = document.getElementById('adjustment-warehouse-select');
        
        if (productSelect && warehouseSelect) {
            productSelect.addEventListener('change', loadCurrentQuantity);
            warehouseSelect.addEventListener('change', loadCurrentQuantity);
        }
    }
}

// Dashboard Data Loading
function loadDashboardData() {
    fetch('api/dashboard.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('total-products').textContent = data.data.total_products || 0;
                document.getElementById('total-inventory').textContent = data.data.total_inventory || 0;
                document.getElementById('total-suppliers').textContent = data.data.total_suppliers || 0;
                document.getElementById('pending-orders').textContent = data.data.pending_orders || 0;
                
                // Display SQL query
                displaySQL(data.sql || 'Multiple SELECT queries executed');
                
                // Load recent transactions
                loadRecentTransactions();
            }
        })
        .catch(error => console.error('Error loading dashboard:', error));
}

function loadRecentTransactions() {
    fetch('api/transactions.php?limit=10')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayTransactionsInDashboard(data.data);
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading recent transactions:', error));
}

function displayTransactionsInDashboard(transactions) {
    const container = document.getElementById('recent-transactions-list');
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No recent transactions</p></div>';
        return;
    }
    
    let html = '<table><thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Quantity</th><th>Warehouse</th></tr></thead><tbody>';
    
    transactions.forEach(trans => {
        html += `
            <tr>
                <td>${formatDateTime(trans.transaction_date)}</td>
                <td>${trans.product_name || 'N/A'}</td>
                <td><span class="status-badge status-${trans.transaction_type.toLowerCase()}">${trans.transaction_type}</span></td>
                <td>${trans.quantity_change}</td>
                <td>${trans.warehouse_name || 'N/A'}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Products Management
function loadProducts() {
    fetch('api/products.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayProducts(data.data);
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading products:', error));
}

function displayProducts(products) {
    const container = document.getElementById('products-list');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No products found. Add your first product!</p></div>';
        return;
    }
    
    let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Supplier</th><th>Price</th><th>Reorder Level</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    products.forEach(product => {
        html += `
            <tr>
                <td>${product.product_id}</td>
                <td>${product.product_name}</td>
                <td>${product.category_name || 'N/A'}</td>
                <td>${product.supplier_name || 'N/A'}</td>
                <td>$${parseFloat(product.unit_price).toFixed(2)}</td>
                <td>${product.reorder_level}</td>
                <td>${product.is_active == 1 ? '<span class="status-badge status-received">Active</span>' : '<span class="status-badge status-cancelled">Inactive</span>'}</td>
                <td class="table-actions">
                    <button class="btn btn-small btn-secondary" onclick="viewProduct(${product.product_id})">View</button>
                    <button class="btn btn-small btn-danger" onclick="deleteProduct(${product.product_id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function showAddProductForm() {
    document.getElementById('add-product-form').style.display = 'block';
}

function hideAddProductForm() {
    document.getElementById('add-product-form').style.display = 'none';
    document.getElementById('product-form').reset();
}

function handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('api/products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Product added successfully!');
            if (data.sql) displaySQL(data.sql);
            hideAddProductForm();
            loadProducts();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error adding product:', error));
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    fetch(`api/products.php?id=${productId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Product deleted successfully!');
            if (data.sql) displaySQL(data.sql);
            loadProducts();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error deleting product:', error));
}

function viewProduct(productId) {
    fetch(`api/products.php?id=${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const product = data.data;
                alert(`Product Details:\n\nName: ${product.product_name}\nPrice: $${product.unit_price}\nCategory: ${product.category_name || 'N/A'}\nSupplier: ${product.supplier_name || 'N/A'}\nDescription: ${product.description || 'N/A'}`);
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error viewing product:', error));
}

// Inventory Management
function loadInventory() {
    fetch('api/inventory.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayInventory(data.data);
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading inventory:', error));
}

function displayInventory(inventory) {
    const container = document.getElementById('inventory-list');
    
    if (!inventory || inventory.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-warehouse"></i><p>No inventory records found</p></div>';
        return;
    }
    
    let html = '<table><thead><tr><th>Product</th><th>Warehouse</th><th>On Hand</th><th>Reserved</th><th>Available</th><th>Avg Cost</th><th>Last Updated</th></tr></thead><tbody>';
    
    inventory.forEach(inv => {
        const available = inv.quantity_on_hand - inv.quantity_reserved;
        html += `
            <tr>
                <td>${inv.product_name}</td>
                <td>${inv.warehouse_name}</td>
                <td>${inv.quantity_on_hand}</td>
                <td>${inv.quantity_reserved}</td>
                <td><strong>${available}</strong></td>
                <td>$${parseFloat(inv.avg_cost).toFixed(2)}</td>
                <td>${formatDateTime(inv.last_updated)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function showStockAdjustmentForm() {
    document.getElementById('stock-adjustment-form').style.display = 'block';
}

function hideStockAdjustmentForm() {
    document.getElementById('stock-adjustment-form').style.display = 'none';
    document.getElementById('adjustment-form').reset();
}

function loadCurrentQuantity() {
    const productId = document.getElementById('adjustment-product-select').value;
    const warehouseId = document.getElementById('adjustment-warehouse-select').value;
    
    if (!productId || !warehouseId) return;
    
    fetch(`api/inventory.php?product_id=${productId}&warehouse_id=${warehouseId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                document.getElementById('old-quantity-input').value = data.data.quantity_on_hand || 0;
                if (data.sql) displaySQL(data.sql);
            } else {
                document.getElementById('old-quantity-input').value = 0;
            }
        })
        .catch(error => console.error('Error loading current quantity:', error));
}

function handleAdjustmentSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('api/adjustments.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Stock adjustment saved successfully!');
            if (data.sql) displaySQL(data.sql);
            hideStockAdjustmentForm();
            loadInventory();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error saving adjustment:', error));
}

// Suppliers Management
function loadSuppliers() {
    fetch('api/suppliers.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displaySuppliers(data.data);
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading suppliers:', error));
}

function displaySuppliers(suppliers) {
    const container = document.getElementById('suppliers-list');
    
    if (!suppliers || suppliers.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-truck"></i><p>No suppliers found. Add your first supplier!</p></div>';
        return;
    }
    
    let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Contact Person</th><th>Phone</th><th>Email</th><th>Address</th><th>Actions</th></tr></thead><tbody>';
    
    suppliers.forEach(supplier => {
        html += `
            <tr>
                <td>${supplier.supplier_id}</td>
                <td>${supplier.supplier_name}</td>
                <td>${supplier.contact_person || 'N/A'}</td>
                <td>${supplier.phone || 'N/A'}</td>
                <td>${supplier.email || 'N/A'}</td>
                <td>${supplier.address || 'N/A'}</td>
                <td class="table-actions">
                    <button class="btn btn-small btn-danger" onclick="deleteSupplier(${supplier.supplier_id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function showAddSupplierForm() {
    document.getElementById('add-supplier-form').style.display = 'block';
}

function hideAddSupplierForm() {
    document.getElementById('add-supplier-form').style.display = 'none';
    document.getElementById('supplier-form').reset();
}

function handleSupplierSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('api/suppliers.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Supplier added successfully!');
            if (data.sql) displaySQL(data.sql);
            hideAddSupplierForm();
            loadSuppliers();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error adding supplier:', error));
}

function deleteSupplier(supplierId) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    fetch(`api/suppliers.php?id=${supplierId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Supplier deleted successfully!');
            if (data.sql) displaySQL(data.sql);
            loadSuppliers();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error deleting supplier:', error));
}

// Purchase Orders Management
function loadPurchaseOrders() {
    fetch('api/purchase_orders.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayPurchaseOrders(data.data);
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading purchase orders:', error));
}

function displayPurchaseOrders(orders) {
    const container = document.getElementById('purchase-orders-list');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-file-invoice"></i><p>No purchase orders found</p></div>';
        return;
    }
    
    let html = '<table><thead><tr><th>PO Number</th><th>Supplier</th><th>Order Date</th><th>Expected Delivery</th><th>Status</th><th>Total Amount</th><th>Actions</th></tr></thead><tbody>';
    
    orders.forEach(order => {
        html += `
            <tr>
                <td>${order.po_number}</td>
                <td>${order.supplier_name || 'N/A'}</td>
                <td>${formatDate(order.order_date)}</td>
                <td>${formatDate(order.expected_delivery)}</td>
                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                <td class="table-actions">
                    <button class="btn btn-small btn-secondary" onclick="viewPO(${order.po_id})">View</button>
                    <button class="btn btn-small btn-danger" onclick="deletePO(${order.po_id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function showAddPOForm() {
    document.getElementById('add-po-form').style.display = 'block';
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="order_date"]').value = today;
}

function hideAddPOForm() {
    document.getElementById('add-po-form').style.display = 'none';
    document.getElementById('po-form').reset();
}

function handlePOSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('api/purchase_orders.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Purchase order created successfully!');
            if (data.sql) displaySQL(data.sql);
            hideAddPOForm();
            loadPurchaseOrders();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error creating purchase order:', error));
}

function viewPO(poId) {
    fetch(`api/purchase_orders.php?id=${poId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const po = data.data;
                alert(`Purchase Order Details:\n\nPO Number: ${po.po_number}\nSupplier: ${po.supplier_name}\nStatus: ${po.status}\nTotal: $${po.total_amount}\nNotes: ${po.notes || 'N/A'}`);
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error viewing purchase order:', error));
}

function deletePO(poId) {
    if (!confirm('Are you sure you want to delete this purchase order?')) return;
    
    fetch(`api/purchase_orders.php?id=${poId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Purchase order deleted successfully!');
            if (data.sql) displaySQL(data.sql);
            loadPurchaseOrders();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error deleting purchase order:', error));
}

// Transactions Management
function loadTransactions() {
    fetch('api/transactions.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayTransactions(data.data);
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading transactions:', error));
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactions-list');
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exchange-alt"></i><p>No transactions found</p></div>';
        return;
    }
    
    let html = '<table><thead><tr><th>ID</th><th>Product</th><th>Warehouse</th><th>Type</th><th>Quantity</th><th>Unit Cost</th><th>Date</th><th>Reference</th></tr></thead><tbody>';
    
    transactions.forEach(trans => {
        html += `
            <tr>
                <td>${trans.transaction_id}</td>
                <td>${trans.product_name || 'N/A'}</td>
                <td>${trans.warehouse_name || 'N/A'}</td>
                <td><span class="status-badge status-${trans.transaction_type.toLowerCase()}">${trans.transaction_type}</span></td>
                <td>${trans.quantity_change}</td>
                <td>$${trans.unit_cost ? parseFloat(trans.unit_cost).toFixed(2) : '0.00'}</td>
                <td>${formatDateTime(trans.transaction_date)}</td>
                <td>${trans.reference_number || 'N/A'}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function showAddTransactionForm() {
    document.getElementById('add-transaction-form').style.display = 'block';
}

function hideAddTransactionForm() {
    document.getElementById('add-transaction-form').style.display = 'none';
    document.getElementById('transaction-form').reset();
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('api/transactions.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Transaction added successfully!');
            if (data.sql) displaySQL(data.sql);
            hideAddTransactionForm();
            loadTransactions();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error adding transaction:', error));
}

// Helper Functions for Dropdowns
function loadCategoriesForSelect() {
    fetch('api/categories.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('product-category-select');
                if (select) {
                    select.innerHTML = '<option value="">Select Category</option>';
                    data.data.forEach(cat => {
                        select.innerHTML += `<option value="${cat.category_id}">${cat.category_name}</option>`;
                    });
                }
            }
        })
        .catch(error => console.error('Error loading categories:', error));
}

function loadSuppliersForSelect() {
    fetch('api/suppliers.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // For product form
                const productSelect = document.getElementById('product-supplier-select');
                if (productSelect) {
                    productSelect.innerHTML = '<option value="">Select Supplier</option>';
                    data.data.forEach(sup => {
                        productSelect.innerHTML += `<option value="${sup.supplier_id}">${sup.supplier_name}</option>`;
                    });
                }
                
                // For PO form
                const poSelect = document.getElementById('po-supplier-select');
                if (poSelect) {
                    poSelect.innerHTML = '<option value="">Select Supplier</option>';
                    data.data.forEach(sup => {
                        poSelect.innerHTML += `<option value="${sup.supplier_id}">${sup.supplier_name}</option>`;
                    });
                }
            }
        })
        .catch(error => console.error('Error loading suppliers:', error));
}

function loadProductsForSelect() {
    fetch('api/products.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // For transaction form
                const transSelect = document.getElementById('transaction-product-select');
                if (transSelect) {
                    transSelect.innerHTML = '<option value="">Select Product</option>';
                    data.data.forEach(prod => {
                        transSelect.innerHTML += `<option value="${prod.product_id}">${prod.product_name}</option>`;
                    });
                }
                
                // For adjustment form
                const adjSelect = document.getElementById('adjustment-product-select');
                if (adjSelect) {
                    adjSelect.innerHTML = '<option value="">Select Product</option>';
                    data.data.forEach(prod => {
                        adjSelect.innerHTML += `<option value="${prod.product_id}">${prod.product_name}</option>`;
                    });
                }
            }
        })
        .catch(error => console.error('Error loading products:', error));
}

function loadWarehousesForSelect() {
    fetch('api/warehouses.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // For transaction form
                const transSelect = document.getElementById('transaction-warehouse-select');
                if (transSelect) {
                    transSelect.innerHTML = '<option value="">Select Warehouse</option>';
                    data.data.forEach(wh => {
                        transSelect.innerHTML += `<option value="${wh.warehouse_id}">${wh.warehouse_name}</option>`;
                    });
                }
                
                // For adjustment form
                const adjSelect = document.getElementById('adjustment-warehouse-select');
                if (adjSelect) {
                    adjSelect.innerHTML = '<option value="">Select Warehouse</option>';
                    data.data.forEach(wh => {
                        adjSelect.innerHTML += `<option value="${wh.warehouse_id}">${wh.warehouse_name}</option>`;
                    });
                }
            }
        })
        .catch(error => console.error('Error loading warehouses:', error));
}

// SQL Dialog Functions
function initializeSQLDialog() {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('sqlHistory');
    if (savedHistory) {
        sqlHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
}

function displaySQL(sql) {
    currentSQL = sql;
    document.getElementById('current-sql-query').textContent = sql;
    
    // Add to history
    addToHistory(sql);
}

function addToHistory(sql) {
    const timestamp = new Date().toISOString();
    sqlHistory.unshift({ sql, timestamp });
    
    // Keep only last 50 queries
    if (sqlHistory.length > 50) {
        sqlHistory = sqlHistory.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('sqlHistory', JSON.stringify(sqlHistory));
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyContainer = document.getElementById('sql-history');
    const countElement = document.getElementById('history-count');
    
    countElement.textContent = sqlHistory.length;
    
    if (sqlHistory.length === 0) {
        historyContainer.innerHTML = '<p style="text-align:center; color: #64748b;">No history yet</p>';
        return;
    }
    
    let html = '';
    sqlHistory.forEach((item, index) => {
        html += `
            <div class="history-item" onclick="selectHistoryItem(${index})">
                <div class="timestamp">${formatDateTime(item.timestamp)}</div>
                <div class="query">${item.sql}</div>
            </div>
        `;
    });
    
    historyContainer.innerHTML = html;
}

function selectHistoryItem(index) {
    const item = sqlHistory[index];
    currentSQL = item.sql;
    document.getElementById('current-sql-query').textContent = item.sql;
}

function toggleSQLDialog() {
    const dialog = document.getElementById('sql-dialog');
    const toggle = document.getElementById('sql-dialog-toggle');
    
    if (dialog.classList.contains('minimized')) {
        dialog.classList.remove('minimized');
        toggle.style.display = 'none';
    } else {
        dialog.classList.add('minimized');
        toggle.style.display = 'block';
    }
}

function toggleSQLHistory() {
    const historySection = document.getElementById('sql-history-section');
    historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
}

function clearSQLHistory() {
    if (!confirm('Are you sure you want to clear the SQL history?')) return;
    
    sqlHistory = [];
    localStorage.removeItem('sqlHistory');
    updateHistoryDisplay();
}

function copySQLToClipboard() {
    navigator.clipboard.writeText(currentSQL).then(() => {
        alert('SQL query copied to clipboard!');
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
    });
}

function executeCurrentSQL() {
    if (!currentSQL) {
        alert('No SQL query to execute');
        return;
    }
    
    document.getElementById('raw-sql-input').value = currentSQL;
    showSection('sql-executor');
    executeRawSQL();
}

// SQL Executor Functions
function executeRawSQL() {
    const sql = document.getElementById('raw-sql-input').value.trim();
    
    if (!sql) {
        alert('Please enter an SQL query');
        return;
    }
    
    fetch('api/execute_sql.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql })
    })
    .then(response => response.json())
    .then(data => {
        displaySQLResults(data);
        displaySQL(sql);
    })
    .catch(error => {
        console.error('Error executing SQL:', error);
        displaySQLResults({ success: false, message: 'Error executing query' });
    });
}

function displaySQLResults(data) {
    const container = document.getElementById('sql-results');
    
    if (!data.success) {
        container.innerHTML = `<div class="error-message"><strong>Error:</strong> ${data.message}</div>`;
        return;
    }
    
    if (data.type === 'select') {
        if (!data.data || data.data.length === 0) {
            container.innerHTML = '<div class="info-text">Query executed successfully. No results returned.</div>';
            return;
        }
        
        // Display results in table
        const columns = Object.keys(data.data[0]);
        let html = '<table><thead><tr>';
        columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        data.data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                html += `<td>${row[col] !== null ? row[col] : 'NULL'}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        html = `<div class="success-message">Query executed successfully. ${data.data.length} row(s) returned.</div>` + html;
        container.innerHTML = html;
    } else {
        container.innerHTML = `<div class="success-message"><strong>Success!</strong> ${data.message}</div>`;
    }
}

function clearSQLInput() {
    document.getElementById('raw-sql-input').value = '';
    document.getElementById('sql-results').innerHTML = '';
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
}
