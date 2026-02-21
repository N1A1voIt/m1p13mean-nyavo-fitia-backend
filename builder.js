const fs = require('fs');

const content = `<div class="flex justify-between items-center mb-10">
  <div>
    <h1 class="text-4xl font-bold font-display text-gray-900 tracking-tight">Stock & Inventory</h1>
    <p class="text-pink-600 font-bold text-xs uppercase tracking-[0.2em] mt-1">Boutique Management</p>
  </div>
  <div class="flex gap-4">
    <button (click)="openMovementModal()" class="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
      \u21C6 Record Movement
    </button>
    <button (click)="openProductModal()" class="px-6 py-3 bg-pink-600 text-white font-bold rounded-xl shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all active:scale-95">
      + Add Product
    </button>
  </div>
</div>

<div class="flex gap-8 border-b border-gray-100 mb-8">
  <button (click)="setTab('inventory')" [class.border-pink-600]="activeTab === 'inventory'" [class.text-pink-600]="activeTab === 'inventory'" [class.border-transparent]="activeTab !== 'inventory'" [class.text-gray-500]="activeTab !== 'inventory'" class="px-2 py-3 border-b-2 font-bold text-sm tracking-wide transition-all uppercase">
    Inventory
  </button>
  <button (click)="setTab('movements')" [class.border-pink-600]="activeTab === 'movements'" [class.text-pink-600]="activeTab === 'movements'" [class.border-transparent]="activeTab !== 'movements'" [class.text-gray-500]="activeTab !== 'movements'" class="px-2 py-3 border-b-2 font-bold text-sm tracking-wide transition-all uppercase">
    Stock Movements
  </button>
</div>

<div *ngIf="activeTab === 'inventory'">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
    <div class="glass p-6 bg-white border-gray-100 shadow-sm">
      <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Total SKU</p>
      <p class="text-3xl font-black font-display text-gray-900">{{ products.length }}</p>
    </div>
    <div class="glass p-6 bg-white border-red-50 shadow-sm border-l-4 border-red-500" *ngIf="lowStockCount > 0">
      <p class="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">Low Stock Alerts</p>
      <p class="text-3xl font-black font-display text-red-600">{{ lowStockCount }}</p>
    </div>
  </div>

  <div class="glass bg-white overflow-hidden border-gray-100 shadow-sm animate-fade">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-100">
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Image</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Product</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">SKU</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Category</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Price</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Stock</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Status</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr *ngFor="let p of products" class="hover:bg-pink-50/20 transition-colors group">
            <td class="px-6 py-4">
               <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">\uD83D\uDCE6</div>
            </td>
            <td class="px-6 py-4">
              <p class="font-bold text-gray-900 leading-tight">{{ p.name }}</p>
              <button (click)="openMovementModal(p)" class="text-xs text-indigo-600 hover:text-indigo-800 font-bold mt-1 inline-flex items-center gap-1"><span>Refill Stock</span></button>
            </td>
            <td class="px-6 py-4">
              <code class="px-2 py-1 bg-gray-100 text-[10px] font-mono rounded text-gray-500">{{ p.sku }}</code>
            </td>
            <td class="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-tighter">{{ p.category }}</td>
            <td class="px-6 py-4 font-black font-display text-gray-900">{{ p.price | currency:'MGA':'symbol':'1.0-0' }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                 <span class="text-sm font-bold" [class.text-red-600]="p.stock <= p.minStockLevel">{{ p.stock }}</span>
                 <span *ngIf="p.stock <= p.minStockLevel" class="text-xs">\u26A0\uFE0F</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" [class.bg-green-500]="p.active" [class.bg-gray-300]="!p.active"></div>
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">{{ p.active ? 'Active' : 'Archived' }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
               <div class="flex justify-end gap-2">
                 <button (click)="openProductModal(p)" class="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm" title="Edit">\u270F\uFE0F</button>
                 <button (click)="deleteProduct(p._id)" class="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all shadow-sm" title="Delete">\uD83D\uDDD1\uFE0F</button>
               </div>
            </td>
          </tr>
          <tr *ngIf="products.length === 0">
            <td colspan="8" class="px-6 py-8 text-center text-gray-400 font-medium">No products found. Add one to get started!</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<div *ngIf="activeTab === 'movements'">
  <div class="glass bg-white overflow-hidden border-gray-100 shadow-sm animate-fade">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-100">
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Date</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Type</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Product</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Quantity</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Reason</th>
            <th class="px-6 py-4 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Notes</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr *ngFor="let m of stockMovements" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-sm text-gray-600">{{ m.createdAt | date:'short' }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-[10px] font-bold rounded" [class.bg-green-100]="m.type === 'IN'" [class.text-green-800]="m.type === 'IN'" [class.bg-red-100]="m.type === 'OUT'" [class.text-red-800]="m.type === 'OUT'">
                {{ m.type }}
              </span>
            </td>
            <td class="px-6 py-4 font-medium text-gray-900">
              <span *ngIf="m.productId">{{ m.productId.name }} <code class="text-xs text-gray-400">({{m.productId.sku}})</code></span>
              <span *ngIf="!m.productId" class="text-gray-400 italic">Deleted Product</span>
            </td>
            <td class="px-6 py-4 font-bold" [class.text-green-600]="m.type === 'IN'" [class.text-red-600]="m.type === 'OUT'">
              {{ m.type === 'IN' ? '+' : '-' }}{{ m.quantity }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ m.reason }}</td>
            <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{{ m.notes || '-' }}</td>
          </tr>
          <tr *ngIf="stockMovements.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-400 font-medium">No stock movements found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Product Modal -->
<div *ngIf="isProductModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-fade">
  <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-pink-50">
      <h3 class="text-xl font-bold text-pink-900">{{ selectedProduct._id ? 'Edit Product' : 'Add New Product' }}</h3>
      <button (click)="closeProductModal()" class="text-pink-400 hover:text-pink-600 text-2xl leading-none">&times;</button>
    </div>
    <div class="p-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
          <input [(ngModel)]="selectedProduct.name" type="text" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SKU</label>
          <input [(ngModel)]="selectedProduct.sku" type="text" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
          <input [(ngModel)]="selectedProduct.category" type="text" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price</label>
          <input [(ngModel)]="selectedProduct.price" type="number" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min. Stock Level</label>
          <input [(ngModel)]="selectedProduct.minStockLevel" type="number" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none">
        </div>
        <div class="col-span-2 flex items-center gap-2 mt-2">
          <input [(ngModel)]="selectedProduct.active" type="checkbox" id="activeProduct" class="w-5 h-5 text-pink-600 rounded">
          <label for="activeProduct" class="text-sm font-medium text-gray-700">Product is Active</label>
        </div>
      </div>
    </div>
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
      <button (click)="closeProductModal()" class="px-5 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-all">Cancel</button>
      <button (click)="saveProduct()" [disabled]="!selectedProduct.name || !selectedProduct.sku" class="px-5 py-2 bg-pink-600 text-white font-bold rounded-lg shadow-md shadow-pink-200 hover:bg-pink-700 transition-all disabled:opacity-50">Save Product</button>
    </div>
  </div>
</div>

<!-- Stock Movement Modal -->
<div *ngIf="isMovementModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-fade">
  <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
      <h3 class="text-xl font-bold text-indigo-900">Record Stock Movement</h3>
      <button (click)="closeMovementModal()" class="text-indigo-400 hover:text-indigo-600 text-2xl leading-none">&times;</button>
    </div>
    <div class="p-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product</label>
          <select [(ngModel)]="movementModel.productId" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <option value="" disabled>Select a product...</option>
            <option *ngFor="let p of products" [value]="p._id">{{ p.name }} ({{ p.sku }} - Stock: {{ p.stock }})</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
          <select [(ngModel)]="movementModel.type" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <option value="IN">IN (+)</option>
            <option value="OUT">OUT (-)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quantity</label>
          <input [(ngModel)]="movementModel.quantity" type="number" min="1" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none">
        </div>
        <div class="col-span-2">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reason</label>
          <select [(ngModel)]="movementModel.reason" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <option value="Refill">Refill</option>
            <option value="Sale">Sale</option>
            <option value="Adjustment">Adjustment</option>
            <option value="Return">Return</option>
            <option value="Damage">Damage / Loss</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes (Optional)</label>
          <textarea [(ngModel)]="movementModel.notes" rows="2" class="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
        </div>
      </div>
    </div>
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
      <button (click)="closeMovementModal()" class="px-5 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-all">Cancel</button>
      <button (click)="saveMovement()" [disabled]="!movementModel.productId || movementModel.quantity <= 0" class="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Save Movement</button>
    </div>
  </div>
</div>`;
fs.writeFileSync('/home/nyavo/Documents/master/test/frontend/src/app/components/shop-erp/inventory.component.html', content);
