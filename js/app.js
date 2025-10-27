// Global Variables
let sqlHistory = [];
let currentSQL = '';

// Toast Notification System
function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const titles = {
        success: title || 'Success',
        error: title || 'Error',
        warning: title || 'Warning',
        info: title || 'Info'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="closeToast(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

function closeToast(button) {
    const toast = button.closest('.toast');
    removeToast(toast);
}

function removeToast(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// Confirmation Dialog System
function showConfirmDialog(message, onConfirm, onCancel = null, title = 'Confirm Action') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.display = 'flex';
        
        overlay.innerHTML = `
            <div class="modal-content confirm-modal">
                <div class="modal-header">
                    <h3 class="modal-title"><i class="fas fa-exclamation-triangle modal-icon-warning"></i>${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
                    <button class="btn btn-danger modal-confirm-btn">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const confirmBtn = overlay.querySelector('.modal-confirm-btn');
        const cancelBtn = overlay.querySelector('.modal-cancel-btn');

        confirmBtn.onclick = function() {
            overlay.remove();
            resolve(true);
            if (onConfirm) onConfirm();
        };

        cancelBtn.onclick = function() {
            overlay.remove();
            resolve(false);
            if (onCancel) onCancel();
        };

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
                if (onCancel) onCancel();
            }
        });

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                resolve(false);
                document.removeEventListener('keydown', escHandler);
                if (onCancel) onCancel();
            }
        };
        document.addEventListener('keydown', escHandler);
    });
}

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

// Modal Dialog Functions
function showInfoDialog(message, title = 'Information') {
    const modal = document.getElementById('info-modal');
    const modalTitle = document.getElementById('info-modal-title');
    const modalBody = document.getElementById('info-modal-body');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = message;
    modal.style.display = 'flex';
    
    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeInfoDialog();
        }
    };

    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeInfoDialog();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closeInfoDialog() {
    const modal = document.getElementById('info-modal');
    modal.style.display = 'none';
    modal.onclick = null; // Remove event listener
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
    
    // Update Transaction Form
    const updateTransactionForm = document.getElementById('update-transaction-form');
    if (updateTransactionForm) {
        updateTransactionForm.addEventListener('submit', handleTransactionUpdate);
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
    
    // Product Edit Form
    const productEditForm = document.getElementById('product-edit-form');
    if (productEditForm) {
        productEditForm.addEventListener('submit', handleProductUpdate);
    }
    
    // Category Form
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    // Category Edit Form
    const categoryEditForm = document.getElementById('category-edit-form');
    if (categoryEditForm) {
        categoryEditForm.addEventListener('submit', handleCategoryUpdate);
    }
    
    // Warehouse Form
    const warehouseForm = document.getElementById('warehouse-form');
    if (warehouseForm) {
        warehouseForm.addEventListener('submit', handleWarehouseSubmit);
    }
    
    // Warehouse Edit Form
    const warehouseEditForm = document.getElementById('warehouse-edit-form');
    if (warehouseEditForm) {
        warehouseEditForm.addEventListener('submit', handleWarehouseUpdate);
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
    console.log('displayProducts called - Edit button should be visible');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No products found. Add your first product!</p></div>';
        return;
    }
    
    let html = '<table><thead><tr><th>Name</th><th>Category</th><th>Supplier</th><th>Price</th><th>Reorder Level</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    products.forEach(product => {
        html += `
            <tr>
                <td>${product.product_name}</td>
                <td>${product.category_name || 'N/A'}</td>
                <td>${product.supplier_name || 'N/A'}</td>
                <td>$${parseFloat(product.unit_price).toFixed(2)}</td>
                <td>${product.reorder_level}</td>
                <td>${product.is_active == 1 ? '<span class="status-badge status-received">Active</span>' : '<span class="status-badge status-cancelled">Inactive</span>'}</td>
                <td class="table-actions">
                    <button class="btn btn-small btn-secondary" onclick="viewProduct(${product.product_id})">View</button>
                    <button class="btn btn-small btn-primary" onclick="editProduct(${product.product_id})">Edit</button>
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
            showToast('Product added successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideAddProductForm();
            loadProducts();
        } else {
            showToast(data.message, 'error', 'Failed to Add Product');
        }
    })
    .catch(error => {
        console.error('Error adding product:', error);
        showToast('An error occurred while adding the product', 'error');
    });
}

function deleteProduct(productId) {
    showConfirmDialog(
        'Are you sure you want to delete this product? This action cannot be undone.',
        () => {
            fetch(`api/products.php?id=${productId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Product deleted successfully!', 'success');
                    if (data.sql) displaySQL(data.sql);
                    loadProducts();
                } else {
                    showToast(data.message, 'error', 'Failed to Delete');
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                showToast('An error occurred while deleting the product', 'error');
            });
        },
        null,
        'Delete Product'
    );
}

function viewProduct(productId) {
    fetch(`api/products.php?id=${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const product = data.data;
                const details = `
                    <div style="line-height: 1.8;">
                        <p><strong>Product Name:</strong> ${product.product_name}</p>
                        <p><strong>Description:</strong> ${product.description || 'N/A'}</p>
                        <p><strong>Unit Price:</strong> $${parseFloat(product.unit_price).toFixed(2)}</p>
                        <p><strong>Unit of Measure:</strong> ${product.unit_of_measure || 'N/A'}</p>
                        <p><strong>Reorder Level:</strong> ${product.reorder_level}</p>
                        <p><strong>Category:</strong> ${product.category_name || 'N/A'}</p>
                        <p><strong>Supplier:</strong> ${product.supplier_name || 'N/A'}</p>
                        <p><strong>Status:</strong> ${product.is_active == 1 ? '<span style="color: #10b981;">Active</span>' : '<span style="color: #ef4444;">Inactive</span>'}</p>
                        <p><strong>Created Date:</strong> ${formatDate(product.created_date)}</p>
                    </div>
                `;
                showInfoDialog(details, 'Product Details');
                if (data.sql) displaySQL(data.sql);
            } else {
                showToast('Product not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error viewing product:', error);
            showToast('An error occurred while loading product details', 'error');
        });
}

function editProduct(productId) {
    // Load product data
    fetch(`api/products.php?id=${productId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const product = data.data;
                
                // Populate the edit form
                document.getElementById('edit-product-id').value = product.product_id;
                document.getElementById('edit-product-name').value = product.product_name;
                document.getElementById('edit-unit-price').value = product.unit_price;
                document.getElementById('edit-reorder-level').value = product.reorder_level;
                document.getElementById('edit-unit-measure').value = product.unit_of_measure;
                document.getElementById('edit-description').value = product.description || '';
                
                // Load and set dropdowns
                loadCategoriesForEdit(product.category_id);
                loadSuppliersForEdit(product.supplier_id);
                
                // Show edit form
                document.getElementById('edit-product-form').style.display = 'block';
                
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading product for edit:', error));
}

function hideEditProductForm() {
    document.getElementById('edit-product-form').style.display = 'none';
    document.getElementById('product-edit-form').reset();
}

function handleProductUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Convert FormData to URL-encoded string for PUT request
    const params = new URLSearchParams();
    for (const [key, value] of formData) {
        params.append(key, value);
    }
    
    fetch('api/products.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Product updated successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideEditProductForm();
            loadProducts();
        } else {
            showToast(data.message, 'error', 'Failed to Update');
        }
    })
    .catch(error => {
        console.error('Error updating product:', error);
        showToast('An error occurred while updating the product', 'error');
    });
}

function loadCategoriesForEdit(selectedCategoryId) {
    fetch('api/categories.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('edit-product-category-select');
                if (select) {
                    select.innerHTML = '<option value="">Select Category</option>';
                    data.data.forEach(cat => {
                        const selected = cat.category_id == selectedCategoryId ? 'selected' : '';
                        select.innerHTML += `<option value="${cat.category_id}" ${selected}>${cat.category_name}</option>`;
                    });
                }
            }
        })
        .catch(error => console.error('Error loading categories:', error));
}

function loadSuppliersForEdit(selectedSupplierId) {
    fetch('api/suppliers.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('edit-product-supplier-select');
                if (select) {
                    select.innerHTML = '<option value="">Select Supplier</option>';
                    data.data.forEach(sup => {
                        const selected = sup.supplier_id == selectedSupplierId ? 'selected' : '';
                        select.innerHTML += `<option value="${sup.supplier_id}" ${selected}>${sup.supplier_name}</option>`;
                    });
                }
            }
        })
        .catch(error => console.error('Error loading suppliers:', error));
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
    
    let html = '<table><thead><tr><th>Product</th><th>Warehouse</th><th>On Hand</th><th>Reserved</th><th>Available</th><th>Avg Cost</th><th>Last Updated</th><th>Actions</th></tr></thead><tbody>';
    
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
                <td class="table-actions">
                    <button class="btn btn-small btn-info" onclick="viewInventory(${inv.product_id}, ${inv.warehouse_id})"><i class="fas fa-eye"></i> View</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function viewInventory(productId, warehouseId) {
    fetch(`api/inventory.php?product_id=${productId}&warehouse_id=${warehouseId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const inv = data.data;
                const available = inv.quantity_on_hand - inv.quantity_reserved;
                const details = `
                    <div style="line-height: 1.8;">
                        <p><strong>Product:</strong> ${inv.product_name}</p>
                        <p><strong>Warehouse:</strong> ${inv.warehouse_name}</p>
                        <p><strong>Quantity on Hand:</strong> ${inv.quantity_on_hand}</p>
                        <p><strong>Quantity Reserved:</strong> ${inv.quantity_reserved}</p>
                        <p><strong>Available Quantity:</strong> <span style="color: #10b981; font-weight: bold;">${available}</span></p>
                        <p><strong>Average Cost:</strong> $${parseFloat(inv.avg_cost).toFixed(2)}</p>
                        <p><strong>Total Value:</strong> $${(inv.quantity_on_hand * inv.avg_cost).toFixed(2)}</p>
                        <p><strong>Last Updated:</strong> ${formatDateTime(inv.last_updated)}</p>
                    </div>
                `;
                showInfoDialog(details, 'Inventory Details');
                if (data.sql) displaySQL(data.sql);
            } else {
                showToast('Inventory record not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error viewing inventory:', error);
            showToast('An error occurred while loading inventory details', 'error');
        });
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
            showToast('Stock adjustment saved successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideStockAdjustmentForm();
            loadInventory();
        } else {
            showToast(data.message, 'error', 'Failed to Save Adjustment');
        }
    })
    .catch(error => {
        console.error('Error saving adjustment:', error);
        showToast('An error occurred while saving the adjustment', 'error');
    });
}

// Categories Management
function loadCategories() {
    fetch('api/categories.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayCategories(data.data);
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading categories:', error));
}

function displayCategories(categories) {
    const container = document.getElementById('categories-list');
    
    if (!categories || categories.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-tags"></i><p>No categories found. Add your first category!</p></div>';
        return;
    }
    
    let html = '<table><thead><tr><th>ID</th><th>Category Name</th><th>Description</th><th>Product Count</th><th>Actions</th></tr></thead><tbody>';
    
    categories.forEach(category => {
        html += `
            <tr>
                <td>${category.category_id}</td>
                <td><strong>${category.category_name}</strong></td>
                <td>${category.description || 'N/A'}</td>
                <td><span class="badge">${category.product_count || 0} products</span></td>
                <td class="table-actions">
                    <button class="btn btn-small btn-secondary" onclick="viewCategory(${category.category_id})"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-small btn-primary" onclick="editCategory(${category.category_id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteCategory(${category.category_id})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function showAddCategoryForm() {
    document.getElementById('add-category-form').style.display = 'block';
    document.getElementById('edit-category-form').style.display = 'none';
}

function hideAddCategoryForm() {
    document.getElementById('add-category-form').style.display = 'none';
    document.getElementById('category-form').reset();
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('api/categories.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Category added successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideAddCategoryForm();
            loadCategories();
        } else {
            showToast(data.message, 'error', 'Failed to Add Category');
        }
    })
    .catch(error => {
        console.error('Error adding category:', error);
        showToast('An error occurred while adding the category', 'error');
    });
}

function editCategory(categoryId) {
    fetch(`api/categories.php?id=${categoryId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const category = data.data;
                
                document.getElementById('edit-category-id').value = category.category_id;
                document.getElementById('edit-category-name').value = category.category_name;
                document.getElementById('edit-category-description').value = category.description || '';
                
                document.getElementById('edit-category-form').style.display = 'block';
                document.getElementById('add-category-form').style.display = 'none';
                
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading category for edit:', error));
}

function hideEditCategoryForm() {
    document.getElementById('edit-category-form').style.display = 'none';
    document.getElementById('category-edit-form').reset();
}

function handleCategoryUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const params = new URLSearchParams();
    for (const [key, value] of formData) {
        params.append(key, value);
    }
    
    fetch('api/categories.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Category updated successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideEditCategoryForm();
            loadCategories();
        } else {
            showToast(data.message, 'error', 'Failed to Update Category');
        }
    })
    .catch(error => {
        console.error('Error updating category:', error);
        showToast('An error occurred while updating the category', 'error');
    });
}

function deleteCategory(categoryId) {
    showConfirmDialog(
        'Are you sure you want to delete this category? This action cannot be undone.',
        () => {
            fetch(`api/categories.php?id=${categoryId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Category deleted successfully!', 'success');
                    if (data.sql) displaySQL(data.sql);
                    loadCategories();
                } else {
                    showToast(data.message, 'error', 'Failed to Delete');
                }
            })
            .catch(error => {
                console.error('Error deleting category:', error);
                showToast('An error occurred while deleting the category', 'error');
            });
        },
        null,
        'Delete Category'
    );
}

function viewCategory(categoryId) {
    fetch(`api/categories.php?id=${categoryId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const category = data.data;
                const details = `
                    <div style="line-height: 1.8;">
                        <p><strong>Category ID:</strong> ${category.category_id}</p>
                        <p><strong>Category Name:</strong> ${category.category_name}</p>
                        <p><strong>Description:</strong> ${category.description || 'No description available'}</p>
                        <p><strong>Product Count:</strong> ${category.product_count || 0} products</p>
                    </div>
                `;
                showInfoDialog(details, 'Category Details');
                if (data.sql) displaySQL(data.sql);
            } else {
                showToast('Category not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error viewing category:', error);
            showToast('An error occurred while loading category details', 'error');
        });
}

// Warehouses Management
function loadWarehouses() {
    fetch('api/warehouses.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayWarehouses(data.data);
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading warehouses:', error));
}

function displayWarehouses(warehouses) {
    const container = document.getElementById('warehouses-list');
    
    if (!warehouses || warehouses.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i><p>No warehouses found. Add your first warehouse!</p></div>';
        return;
    }
    
    let html = '<table><thead><tr><th>ID</th><th>Warehouse Name</th><th>Location</th><th>Manager</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    warehouses.forEach(warehouse => {
        const status = warehouse.is_active == 1 ? '<span class="status-badge status-received">Active</span>' : '<span class="status-badge status-cancelled">Inactive</span>';
        html += `
            <tr>
                <td>${warehouse.warehouse_id}</td>
                <td><strong>${warehouse.warehouse_name}</strong></td>
                <td>${warehouse.location || 'N/A'}</td>
                <td>${warehouse.manager_name || 'N/A'}</td>
                <td>${warehouse.phone || 'N/A'}</td>
                <td>${status}</td>
                <td class="table-actions">
                    <button class="btn btn-small btn-secondary" onclick="viewWarehouse(${warehouse.warehouse_id})"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-small btn-primary" onclick="editWarehouse(${warehouse.warehouse_id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteWarehouse(${warehouse.warehouse_id})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function showAddWarehouseForm() {
    document.getElementById('add-warehouse-form').style.display = 'block';
    document.getElementById('edit-warehouse-form').style.display = 'none';
}

function hideAddWarehouseForm() {
    document.getElementById('add-warehouse-form').style.display = 'none';
    document.getElementById('warehouse-form').reset();
}

function handleWarehouseSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('api/warehouses.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Warehouse added successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideAddWarehouseForm();
            loadWarehouses();
        } else {
            showToast(data.message, 'error', 'Failed to Add Warehouse');
        }
    })
    .catch(error => {
        console.error('Error adding warehouse:', error);
        showToast('An error occurred while adding the warehouse', 'error');
    });
}

function editWarehouse(warehouseId) {
    fetch(`api/warehouses.php?id=${warehouseId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const warehouse = data.data;
                
                document.getElementById('edit-warehouse-id').value = warehouse.warehouse_id;
                document.getElementById('edit-warehouse-name').value = warehouse.warehouse_name;
                document.getElementById('edit-warehouse-location').value = warehouse.location || '';
                document.getElementById('edit-warehouse-manager').value = warehouse.manager_name || '';
                document.getElementById('edit-warehouse-phone').value = warehouse.phone || '';
                
                document.getElementById('edit-warehouse-form').style.display = 'block';
                document.getElementById('add-warehouse-form').style.display = 'none';
                
                if (data.sql) displaySQL(data.sql);
            }
        })
        .catch(error => console.error('Error loading warehouse for edit:', error));
}

function hideEditWarehouseForm() {
    document.getElementById('edit-warehouse-form').style.display = 'none';
    document.getElementById('warehouse-edit-form').reset();
}

function handleWarehouseUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const params = new URLSearchParams();
    for (const [key, value] of formData) {
        params.append(key, value);
    }
    
    fetch('api/warehouses.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Warehouse updated successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideEditWarehouseForm();
            loadWarehouses();
        } else {
            showToast(data.message, 'error', 'Failed to Update Warehouse');
        }
    })
    .catch(error => {
        console.error('Error updating warehouse:', error);
        showToast('An error occurred while updating the warehouse', 'error');
    });
}

function deleteWarehouse(warehouseId) {
    showConfirmDialog(
        'Are you sure you want to delete this warehouse? This action cannot be undone.',
        () => {
            fetch(`api/warehouses.php?id=${warehouseId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Warehouse deleted successfully!', 'success');
                    if (data.sql) displaySQL(data.sql);
                    loadWarehouses();
                } else {
                    showToast(data.message, 'error', 'Failed to Delete');
                }
            })
            .catch(error => {
                console.error('Error deleting warehouse:', error);
                showToast('An error occurred while deleting the warehouse', 'error');
            });
        },
        null,
        'Delete Warehouse'
    );
}

function viewWarehouse(warehouseId) {
    fetch(`api/warehouses.php?id=${warehouseId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const warehouse = data.data;
                const status = warehouse.is_active == 1 ? '<span style="color: #10b981;">Active</span>' : '<span style="color: #ef4444;">Inactive</span>';
                const details = `
                    <div style="line-height: 1.8;">
                        <p><strong>Warehouse ID:</strong> ${warehouse.warehouse_id}</p>
                        <p><strong>Warehouse Name:</strong> ${warehouse.warehouse_name}</p>
                        <p><strong>Location:</strong> ${warehouse.location || 'N/A'}</p>
                        <p><strong>Manager Name:</strong> ${warehouse.manager_name || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${warehouse.phone || 'N/A'}</p>
                        <p><strong>Status:</strong> ${status}</p>
                    </div>
                `;
                showInfoDialog(details, 'Warehouse Details');
                if (data.sql) displaySQL(data.sql);
            } else {
                showToast('Warehouse not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error viewing warehouse:', error);
            showToast('An error occurred while loading warehouse details', 'error');
        });
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
                    <button class="btn btn-small btn-info" onclick="viewSupplier(${supplier.supplier_id})"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-small btn-danger" onclick="deleteSupplier(${supplier.supplier_id})"><i class="fas fa-trash"></i> Delete</button>
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
            showToast('Supplier added successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideAddSupplierForm();
            loadSuppliers();
        } else {
            showToast(data.message, 'error', 'Failed to Add Supplier');
        }
    })
    .catch(error => {
        console.error('Error adding supplier:', error);
        showToast('An error occurred while adding the supplier', 'error');
    });
}

function deleteSupplier(supplierId) {
    showConfirmDialog(
        'Are you sure you want to delete this supplier? This action cannot be undone.',
        () => {
            fetch(`api/suppliers.php?id=${supplierId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Supplier deleted successfully!', 'success');
                    if (data.sql) displaySQL(data.sql);
                    loadSuppliers();
                } else {
                    showToast(data.message, 'error', 'Failed to Delete');
                }
            })
            .catch(error => {
                console.error('Error deleting supplier:', error);
                showToast('An error occurred while deleting the supplier', 'error');
            });
        },
        null,
        'Delete Supplier'
    );
}

function viewSupplier(supplierId) {
    fetch(`api/suppliers.php?id=${supplierId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const supplier = data.data;
                const details = `
                    <div style="line-height: 1.8;">
                        <p><strong>Supplier ID:</strong> ${supplier.supplier_id}</p>
                        <p><strong>Supplier Name:</strong> ${supplier.supplier_name}</p>
                        <p><strong>Contact Person:</strong> ${supplier.contact_person || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${supplier.phone || 'N/A'}</p>
                        <p><strong>Email:</strong> ${supplier.email || 'N/A'}</p>
                        <p><strong>Address:</strong> ${supplier.address || 'N/A'}</p>
                        <p><strong>Created Date:</strong> ${formatDate(supplier.created_date)}</p>
                    </div>
                `;
                showInfoDialog(details, 'Supplier Details');
                if (data.sql) displaySQL(data.sql);
            } else {
                showToast('Supplier not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error viewing supplier:', error);
            showToast('An error occurred while loading supplier details', 'error');
        });
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
            showToast('Purchase order created successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideAddPOForm();
            loadPurchaseOrders();
        } else {
            showToast(data.message, 'error', 'Failed to Create PO');
        }
    })
    .catch(error => {
        console.error('Error creating purchase order:', error);
        showToast('An error occurred while creating the purchase order', 'error');
    });
}

function viewPO(poId) {
    fetch(`api/purchase_orders.php?id=${poId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const po = data.data;
                const details = `
                    <div style="line-height: 1.8;">
                        <p><strong>PO Number:</strong> ${po.po_number}</p>
                        <p><strong>Supplier:</strong> ${po.supplier_name || 'N/A'}</p>
                        <p><strong>Order Date:</strong> ${formatDate(po.order_date)}</p>
                        <p><strong>Expected Delivery:</strong> ${po.expected_delivery ? formatDate(po.expected_delivery) : 'N/A'}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${po.status.toLowerCase()}">${po.status}</span></p>
                        <p><strong>Total Amount:</strong> $${parseFloat(po.total_amount || 0).toFixed(2)}</p>
                        <p><strong>Notes:</strong> ${po.notes || 'No notes available'}</p>
                        <p><strong>Created Date:</strong> ${formatDateTime(po.created_date)}</p>
                    </div>
                `;
                showInfoDialog(details, 'Purchase Order Details');
                if (data.sql) displaySQL(data.sql);
            } else {
                showToast('Purchase order not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error viewing purchase order:', error);
            showToast('An error occurred while loading purchase order details', 'error');
        });
}

function deletePO(poId) {
    showConfirmDialog(
        'Are you sure you want to delete this purchase order? This action cannot be undone.',
        () => {
            fetch(`api/purchase_orders.php?id=${poId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Purchase order deleted successfully!', 'success');
                    if (data.sql) displaySQL(data.sql);
                    loadPurchaseOrders();
                } else {
                    showToast(data.message, 'error', 'Failed to Delete');
                }
            })
            .catch(error => {
                console.error('Error deleting purchase order:', error);
                showToast('An error occurred while deleting the purchase order', 'error');
            });
        },
        null,
        'Delete Purchase Order'
    );
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
    
    let html = '<table><thead><tr><th>Product</th><th>Warehouse</th><th>Type</th><th>Quantity</th><th>Unit Cost</th><th>Date</th><th>Reference</th><th>Actions</th></tr></thead><tbody>';
    
    transactions.forEach(trans => {
        html += `
            <tr>
                <td>${trans.product_name || 'N/A'}</td>
                <td>${trans.warehouse_name || 'N/A'}</td>
                <td><span class="status-badge status-${trans.transaction_type.toLowerCase()}">${trans.transaction_type}</span></td>
                <td>${trans.quantity_change}</td>
                <td>$${trans.unit_cost ? parseFloat(trans.unit_cost).toFixed(2) : '0.00'}</td>
                <td>${formatDateTime(trans.transaction_date)}</td>
                <td>${trans.reference_number || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewTransaction(${trans.transaction_id})"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-sm btn-primary" onclick="editTransaction(${trans.transaction_id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${trans.transaction_id})"><i class="fas fa-trash"></i> Delete</button>
                </td>
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
            showToast('Transaction added successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideAddTransactionForm();
            loadTransactions();
        } else {
            showToast(data.message, 'error', 'Failed to Add Transaction');
        }
    })
    .catch(error => {
        console.error('Error adding transaction:', error);
        showToast('An error occurred while adding the transaction', 'error');
    });
}

// Edit Transaction
function editTransaction(transactionId) {
    console.log('editTransaction called with ID:', transactionId);
    
    // Fetch transaction details
    fetch(`api/transactions.php?id=${transactionId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Transaction data received:', data);
            if (data.success) {
                // Handle both array and single object response
                const trans = Array.isArray(data.data) ? data.data[0] : data.data;
                
                console.log('Transaction object:', trans);
                
                // Populate form fields
                document.getElementById('edit-transaction-id').value = trans.transaction_id;
                document.getElementById('edit-quantity-change').value = trans.quantity_change;
                document.getElementById('edit-unit-cost').value = trans.unit_cost || '';
                document.getElementById('edit-reference-number').value = trans.reference_number || '';
                document.getElementById('edit-notes').value = trans.notes || '';
                document.getElementById('edit-transaction-type').value = trans.transaction_type;
                
                // Load and select product
                loadProductsForEditTransaction(trans.product_id);
                
                // Load and select warehouse
                loadWarehousesForEditTransaction(trans.warehouse_id);
                
                // Show the edit form
                document.getElementById('edit-transaction-form').style.display = 'block';
                document.getElementById('edit-transaction-form').scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch(error => console.error('Error loading transaction:', error));
}

function hideEditTransactionForm() {
    document.getElementById('edit-transaction-form').style.display = 'none';
    document.getElementById('update-transaction-form').reset();
}

function handleTransactionUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    fetch('api/transactions.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Transaction updated successfully!', 'success');
            if (data.sql) displaySQL(data.sql);
            hideEditTransactionForm();
            loadTransactions();
        } else {
            showToast(data.message, 'error', 'Failed to Update');
        }
    })
    .catch(error => {
        console.error('Error updating transaction:', error);
        showToast('An error occurred while updating the transaction', 'error');
    });
}

function loadProductsForEditTransaction(selectedProductId) {
    fetch('api/products.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('edit-transaction-product-select');
                select.innerHTML = '<option value="">Select Product</option>';
                data.data.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.product_id;
                    option.textContent = product.product_name;
                    if (product.product_id == selectedProductId) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error loading products:', error));
}

function loadWarehousesForEditTransaction(selectedWarehouseId) {
    fetch('api/warehouses.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('edit-transaction-warehouse-select');
                select.innerHTML = '<option value="">Select Warehouse</option>';
                data.data.forEach(warehouse => {
                    const option = document.createElement('option');
                    option.value = warehouse.warehouse_id;
                    option.textContent = warehouse.warehouse_name;
                    if (warehouse.warehouse_id == selectedWarehouseId) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error loading warehouses:', error));
}

// Delete Transaction
function deleteTransaction(transactionId) {
    showConfirmDialog(
        'Are you sure you want to delete this transaction? This action cannot be undone.',
        () => {
            fetch(`api/transactions.php?id=${transactionId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Transaction deleted successfully!', 'success');
                    if (data.sql) displaySQL(data.sql);
                    loadTransactions();
                } else {
                    showToast(data.message, 'error', 'Failed to Delete');
                }
            })
            .catch(error => {
                console.error('Error deleting transaction:', error);
                showToast('An error occurred while deleting the transaction', 'error');
            });
        },
        null,
        'Delete Transaction'
    );
}

// View Transaction
function viewTransaction(transactionId) {
    fetch(`api/transactions.php?id=${transactionId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const trans = Array.isArray(data.data) ? data.data[0] : data.data;
                
                const details = `
                    <div style="line-height: 1.8;">
                        <p><strong>Transaction ID:</strong> ${trans.transaction_id}</p>
                        <p><strong>Product:</strong> ${trans.product_name || 'N/A'}</p>
                        <p><strong>Warehouse:</strong> ${trans.warehouse_name || 'N/A'}</p>
                        <p><strong>Type:</strong> <span class="status-badge status-${trans.transaction_type.toLowerCase()}">${trans.transaction_type}</span></p>
                        <p><strong>Quantity Change:</strong> ${trans.quantity_change > 0 ? '+' : ''}${trans.quantity_change}</p>
                        <p><strong>Unit Cost:</strong> $${trans.unit_cost ? parseFloat(trans.unit_cost).toFixed(2) : '0.00'}</p>
                        <p><strong>Transaction Date:</strong> ${formatDateTime(trans.transaction_date)}</p>
                        <p><strong>Reference Number:</strong> ${trans.reference_number || 'N/A'}</p>
                        <p><strong>Notes:</strong> ${trans.notes || 'No notes available'}</p>
                    </div>
                `;
                
                showInfoDialog(details, 'Transaction Details');
                if (data.sql) displaySQL(data.sql);
            } else {
                showToast('Transaction not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error loading transaction:', error);
            showToast('An error occurred while loading transaction details', 'error');
        });
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
    
    // Make SQL dialog draggable
    makeDraggable(document.getElementById('sql-dialog'));
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.sql-dialog-header');
    
    if (header) {
        header.style.cursor = 'move';
        header.onmousedown = dragMouseDown;
    }
    
    function dragMouseDown(e) {
        e.preventDefault();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Set the element's new position
        const newTop = element.offsetTop - pos2;
        const newLeft = element.offsetLeft - pos1;
        
        // Keep dialog within viewport bounds
        const maxTop = window.innerHeight - element.offsetHeight;
        const maxLeft = window.innerWidth - element.offsetWidth;
        
        element.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
        element.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    }
    
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
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
    showConfirmDialog(
        'Are you sure you want to clear all SQL history? This action cannot be undone.',
        () => {
            sqlHistory = [];
            localStorage.removeItem('sqlHistory');
            updateHistoryDisplay();
            showToast('SQL history cleared successfully', 'success', 'History Cleared');
        },
        null,
        'Clear SQL History'
    );
}

function copySQLToClipboard() {
    navigator.clipboard.writeText(currentSQL).then(() => {
        showToast('SQL query copied to clipboard!', 'success', 'Copied');
    }).catch(err => {
        console.error('Error copying to clipboard:', err);
        showToast('Failed to copy query to clipboard', 'error', 'Copy Failed');
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
