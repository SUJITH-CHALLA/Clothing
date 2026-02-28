"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Loader2, Upload } from "lucide-react";
import { MagneticButton } from "@/components/premium/MagneticButton";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminInventoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [viewingProduct, setViewingProduct] = useState<any>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // New Product Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        price: "",
        category: "Tops",
        stock_count: "10",
        is_limited_drop: false,
        images: [] as string[],
    });

    const supabase = createClient();

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setInventory(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleSyncRole = async () => {
        setIsSyncing(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");

            const { error } = await supabase
                .from("profiles")
                .update({ role: 'admin' })
                .eq("id", session.user.id);

            if (error) throw error;
            toast.success("Admin role synced successfully. Please refresh or retry.");
        } catch (error: any) {
            toast.error("Failed to sync role: " + error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError, data } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, publicUrl]
            }));
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        if (name === "name") {
            setFormData(prev => ({
                ...prev,
                name: value,
                slug: value.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '')
            }));
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const productPayload = {
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
                price: parseInt(formData.price),
                category: formData.category,
                stock_count: parseInt(formData.stock_count),
                is_limited_drop: formData.is_limited_drop,
                images: formData.images,
                is_active: true
            };

            let error;
            if (editingProduct) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productPayload)
                    .eq('id', editingProduct.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([productPayload]);
                error = insertError;
            }

            if (error) throw error;

            toast.success(editingProduct ? "Product updated" : "Product added");
            setIsAddModalOpen(false);
            setEditingProduct(null);
            setFormData({
                name: "", slug: "", description: "", price: "", category: "Tops", stock_count: "10", is_limited_drop: false, images: []
            });
            fetchInventory();
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            slug: product.slug,
            description: product.description || "",
            price: product.price.toString(),
            category: product.category,
            stock_count: product.stock_count.toString(),
            is_limited_drop: product.is_limited_drop,
            images: product.images || [],
        });
        setIsAddModalOpen(true);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete: " + error.message);
        } else {
            toast.success("Product deleted");
            fetchInventory();
        }
    };

    const filteredInventory = inventory.filter(
        (item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold">Inventory</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Manage your products, stock levels, and exclusive drops.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleSyncRole}
                        disabled={isSyncing}
                        className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/5 disabled:opacity-50"
                    >
                        {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Sync Permissions
                    </button>

                    <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                        setIsAddModalOpen(open);
                        if (!open) {
                            setEditingProduct(null);
                            setFormData({
                                name: "", slug: "", description: "", price: "", category: "Tops", stock_count: "10", is_limited_drop: false, images: []
                            });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <div>
                                <MagneticButton>
                                    <button className="flex items-center gap-2 rounded-xl bg-volt px-4 py-2.5 text-sm font-semibold text-deep-black transition-all hover:bg-volt/90">
                                        <Plus className="h-4 w-4" />
                                        Add Product
                                    </button>
                                </MagneticButton>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="border-white/10 bg-[#0a0a0a] text-text-primary sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="font-heading text-xl font-bold">
                                    {editingProduct ? "Edit Product" : "Add New Product"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddProduct} className="mt-4 space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Product Name</label>
                                        <input required name="name" value={formData.name} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm focus:border-volt/50 focus:outline-none" placeholder="e.g. Phantom Hoodie" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Images</label>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {formData.images.map((url, i) => (
                                                <div key={i} className="relative group h-20 w-20 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="h-20 w-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 hover:border-volt/30 transition-colors cursor-pointer text-text-secondary hover:text-volt">
                                                {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                                <span className="text-[10px] mt-1">Upload</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Description</label>
                                        <textarea required name="description" value={formData.description} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm focus:border-volt/50 focus:outline-none min-h-[100px]" placeholder="Brief product description..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Price (Paise)</label>
                                            <input required type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm focus:border-volt/50 focus:outline-none" placeholder="299900" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Stock Initial</label>
                                            <input required type="number" name="stock_count" value={formData.stock_count} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm focus:border-volt/50 focus:outline-none" placeholder="10" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Category</label>
                                            <select name="category" value={formData.category} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm focus:border-volt/50 focus:outline-none appearance-none">
                                                <option value="Tops">Tops</option>
                                                <option value="Bottoms">Bottoms</option>
                                                <option value="Outerwear">Outerwear</option>
                                                <option value="Accessories">Accessories</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Slug</label>
                                            <input required name="slug" value={formData.slug} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-white/10 bg-surface px-4 py-2.5 text-sm focus:border-volt/50 focus:outline-none" placeholder="phantom-hoodie" />
                                        </div>
                                    </div>

                                    <div className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-white/10 p-4">
                                        <input type="checkbox" id="is_limited_drop" name="is_limited_drop" checked={formData.is_limited_drop} onChange={handleChange} className="h-4 w-4 rounded border-white/10 bg-surface text-volt accent-volt" />
                                        <div className="space-y-1 leading-none">
                                            <label htmlFor="is_limited_drop" className="text-sm font-medium">Limited Drop</label>
                                            <p className="text-sm text-text-secondary">This item will be highlighted as exclusive.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/5">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="rounded-lg bg-volt px-5 py-2.5 text-sm font-semibold text-deep-black hover:bg-volt/90 disabled:opacity-50 flex items-center gap-2">
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                        {editingProduct ? "Save Changes" : "Create Product"}
                                    </button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={!!viewingProduct} onOpenChange={(open) => !open && setViewingProduct(null)}>
                        <DialogContent className="border-white/10 bg-[#0a0a0a] text-text-primary sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="font-heading text-xl font-bold">Product Summary</DialogTitle>
                            </DialogHeader>
                            {viewingProduct && (
                                <div className="space-y-6 mt-4">
                                    <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                                        <img
                                            src={viewingProduct.images?.[0] || 'https://via.placeholder.com/400'}
                                            className="h-full w-full object-cover"
                                            alt={viewingProduct.name}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-text-secondary">Name</p>
                                            <p className="font-bold">{viewingProduct.name}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] uppercase tracking-widest text-text-secondary">Price</p>
                                            <p className="font-bold text-volt">₹{(viewingProduct.price / 100).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-text-secondary">Category</p>
                                            <p className="font-bold">{viewingProduct.category}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] uppercase tracking-widest text-text-secondary">Stock</p>
                                            <p className="font-bold">{viewingProduct.stock_count}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase tracking-widest text-text-secondary">Description</p>
                                        <p className="text-sm text-text-secondary leading-relaxed">{viewingProduct.description}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const p = viewingProduct;
                                            setViewingProduct(null);
                                            handleEditClick(p);
                                        }}
                                        className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Edit Full Details
                                    </button>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-surface pb-4 shadow-xl">
                {/* Toolbar */}
                <div className="flex items-center justify-between border-b border-white/5 p-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-lg border border-white/10 bg-deep-black pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-volt/30 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-text-secondary hover:bg-white/5 hover:text-text-primary">
                            Filter
                        </button>
                        <button className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-text-secondary hover:bg-white/5 hover:text-text-primary">
                            Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-xs text-text-secondary">
                            <tr>
                                <th className="px-6 py-3 font-medium">Product</th>
                                <th className="px-6 py-3 font-medium">Category</th>
                                <th className="px-6 py-3 font-medium">Stock</th>
                                <th className="px-6 py-3 font-medium">Price</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-volt" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInventory.map((item) => (
                                <tr key={item.id} className="transition-colors hover:bg-white-[0.02]">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 rounded bg-white/10 overflow-hidden">
                                                {item.images?.[0] && (
                                                    <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-primary">{item.name}</p>
                                                <p className="text-xs text-text-secondary">{item.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">{item.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 ${item.stock_count <= 10 ? (item.stock_count === 0 ? 'text-red-400' : 'text-yellow-400') : 'text-text-primary'}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${item.stock_count <= 10 ? (item.stock_count === 0 ? 'bg-red-400' : 'bg-yellow-400') : 'bg-volt'}`}></span>
                                            {item.stock_count} {item.stock_count === 0 && "(Out)"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-primary">₹{item.price?.toLocaleString("en-IN")}</td>
                                    <td className="px-6 py-4">
                                        {item.is_limited_drop && (
                                            <span className="inline-flex rounded-full bg-volt/10 px-2 py-0.5 text-[10px] font-semibold text-volt border border-volt/20">
                                                Limited Drop
                                            </span>
                                        )}
                                        {!item.is_active && (
                                            <span className="inline-flex ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500 border border-red-500/20">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                                        <button
                                            onClick={() => setViewingProduct(item)}
                                            className="p-2 text-text-secondary transition-colors hover:text-white"
                                            title="View Summary"
                                        >
                                            <Search className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="p-2 text-text-secondary transition-colors hover:text-volt"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(item.id)}
                                            className="p-2 text-text-secondary transition-colors hover:text-red-500"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!loading && filteredInventory.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-text-secondary">No products found matching &quot;{searchTerm}&quot;</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
