import { actionUserName, addDataToAPI, getDataFromAPI, getPesananByUUID, updateMenuStock } from "../../../config/redux/action"
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import './Dasboard.scss';

class Dasboard extends Component {
    state = {
        nama: "",
        no_meja: "",
        no_telepon: "",
        cart: [], // Daftar pesanan
        showForm: false, // Untuk menampilkan atau menyembunyikan form,
        activeTab: 'menu', // Tab aktif (menu atau pesanan), 
        isLoading: false, // Menambahkan state isLoading
        selectedCategory: 'all', // Filter kategori (all, makanan, minuman)
    }

    componentDidMount(){
        this.props.getMenus()
        
        const orderID = localStorage.getItem("orderID");

        // Mengecek apakah orderID ada di localStorage
        // if (orderID) {
        //     this.props.getPesanan(orderID); // Memanggil fungsi getPesanan jika orderID ada
        // } else {
        //     console.log("OrderID tidak ditemukan di localStorage.");
    // }
        this.props.getPesanan(this.getOrderIDFromStorage()); // Memanggil fungsi getPesanan jika orderID ada
        
    }

    changeCategory = (category) => {
        this.setState({ selectedCategory: category });
      }

    addToCart = (menu) => {
        const { cart } = this.state;
    
        if (menu.stok <= 0) {
            alert("Stok menu habis!");
            return;
        }
    
        const existingItem = cart.find((item) => item.id === menu.id);
        if (existingItem) {
            if (existingItem.quantity >= menu.stok) {
                alert(`Stok untuk ${menu.nama} tidak mencukupi!`);
                return;
            }
            existingItem.quantity += 1;
        } else {
            cart.push({ ...menu, quantity: 1 });
        }
    
        this.setState({ cart });
    };



    increaseQuantity = (menu) => {
        const { cart } = this.state;
        const item = cart.find((item) => item.id === menu.id);
    
        if (item && item.quantity < menu.stok) {
            item.quantity += 1;
            this.setState({ cart });
        } else {
            alert("Stok tidak mencukupi!");
        }
    };
    
    decreaseQuantity = (menu) => {
        const { cart } = this.state;
        const item = cart.find((item) => item.id === menu.id);
    
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                this.removeFromCart(menu);
            }
            this.setState({ cart });
        }
    };
    
    removeFromCart = (menu) => {
        const { cart } = this.state;
        const newCart = cart.filter((item) => item.id !== menu.id);
        this.setState({ cart: newCart });
    };
    
    handleBackClick = () => {
        this.setState({ showForm: false }); // Mengubah state untuk kembali ke menu
    }


    handlePesanClick = () => {
        const { cart } = this.state;
    
        if (cart.length === 0) {
            alert("Keranjang kosong! Silakan tambahkan menu terlebih dahulu.");
            return;
        }
    
        this.setState({ showForm: true }); // Tampilkan form pengisian data
    };

    generateOrderID = () => {
        const timestamp = new Date().getTime();  // Menggunakan waktu sekarang sebagai dasar
        const randomNumber = Math.floor(Math.random() * 1000);  // Angka acak untuk memastikan keunikan
        const orderID = `ORDER-${timestamp}-${randomNumber}`;  // Format ID pesanan
    
        // Menyimpan orderID ke localStorage
        localStorage.setItem("orderID", orderID);
    
        return orderID;
    }


    getOrderIDFromStorage = () => {
        // Cek apakah ID pesanan sudah ada di localStorage
        const orderID = localStorage.getItem("orderID");
    
        if (orderID) {
            return orderID;  // Kembalikan ID pesanan yang sudah disimpan
        } else {
            // Jika ID pesanan belum ada, buat yang baru
            return this.generateOrderID();  // Gunakan fungsi generate untuk membuat ID baru
        }
    }
    
    
    completeOrder = async (e) => {
        this.setState({ isLoading: true });
        e.preventDefault();
        const { cart, nama, no_meja } = this.state;
    
        if (cart.length === 0) {
            alert("Keranjang kosong! Silakan tambahkan menu.");
            return;
        }
    
        const orderData = {
            daftar_item: cart.map(item => ({
                id_menu: item.id,
                jumlah: item.quantity,
                dimeja:false
            })),
            diproses: true,
            id_pesanan: this.getOrderIDFromStorage(),
            nama_pemesan: nama, // Gunakan nama dari form
            no_meja, // Gunakan nomor meja dari form
            timestamp: new Date().getTime(),
            total_harga: cart.reduce((total, item) => total + (item.harga * item.quantity), 0)
        };

        try {
            // Memanggil Redux action untuk menambahkan pesanan
            // console.log(orderData)
            await this.props.addPesanan(orderData);  // Tunggu hingga pesanan berhasil diproses
            
            alert("Pesanan berhasil dibuat!");  // Menampilkan konfirmasi keberhasilan
            this.setState({ isLoading: false });

        // Data untuk mengupdate stok menu
        const menuUpdates = cart.map(item => ({
            id: item.id,      // ID menu
            quantity: item.quantity // Jumlah yang dipesan
        }));

        // Memanggil Redux action untuk mengurangi stok menu
        await this.props.updateStock(menuUpdates);
    
            // Reset keranjang dan sembunyikan form setelah pesanan berhasil
            this.setState({ 
                cart: [],
                showForm: false
            });
    
        } catch (error) {
            console.error("Error saat menyimpan pesanan:", error);
            alert("Gagal menyimpan pesanan. Silakan coba lagi.");
            this.setState({ isLoading: false });
        }
    };


       // Fungsi untuk mengganti tab aktif
       changeTab = (tab) => {
        this.setState({ activeTab: tab });
    }
    

 
    render(){
        const { cart, showForm, nama, isLoading, no_meja, activeTab } = this.state;
        const { menus, pesanan } = this.props;
        // console.log('pesanan =>', pesanan)

        return (
            <div className="menu-container">
                <header className="menu-header">
                    <h1>Warung Lesehan Haji Muslim</h1>
                    <div className="menu-nav">
                        <button 
                            className={`nav-button ${activeTab === 'menu' ? 'active' : ''}`} 
                            onClick={() => this.changeTab('menu')}
                        >
                            Menu
                        </button>
                        <div className="divider">|</div>
                        <button 
                            className={`nav-button ${activeTab === 'pesanan' ? 'active' : ''}`} 
                            onClick={() => this.changeTab('pesanan')}
                        >
                            Pesanan
                        </button>
                    </div>
                </header>

                {/* Tab Konten */}
                {activeTab === 'menu' && !showForm && (
                    <div className="menu-list">
       <div className="menu-categories">
  <button 
    onClick={() => this.changeCategory('all')} 
    className={this.state.selectedCategory === 'all' ? 'active' : ''}
  >
    <i className="fas fa-th"></i> {/* Icon for All */}
    Semua
  </button>
  <button 
    onClick={() => this.changeCategory('Makanan')} 
    className={this.state.selectedCategory === 'Makanan' ? 'active' : ''}
  >
    <i className="fas fa-hamburger"></i> {/* Icon for Makanan */}
    Makanan
  </button>
  <button 
    onClick={() => this.changeCategory('Minuman')} 
    className={this.state.selectedCategory === 'Minuman' ? 'active' : ''}
  >
    <i className="fas fa-cocktail"></i> {/* Icon for Minuman */}
    Minuman
  </button>
</div>



                        {menus
                         .filter(menu => 
                            this.state.selectedCategory === 'all' || menu.jenis === this.state.selectedCategory
                          )
                        .map((menu) => (
                            <div className="menu-item" key={menu.id}>
                                <img src={menu.img_uri} alt={menu.nama} className="menu-image" />
                                <div className="menu-info">
                                    <h2 className="menu-name">{menu.nama}</h2>
                                    <p className="menu-price">Rp {menu.harga.toLocaleString()}</p>
                                </div>
                                <div className="menu-status">
         
            
            {/* Tampilkan "Tersedia: X" sebelum tombol "Tambah" diklik */}
            {!cart.some((item) => item.id === menu.id)  && (
                <p className={`status-text ${menu.stok > 0 ? "available" : "not-available"}`}>
                {menu.stok > 0 ? "Tersedia" : "Habis"}
            </p>
            )}

            {/* Tombol Tambah / Kontrol Jumlah */}
            {cart.some((item) => item.id === menu.id) ? (
               <div className="menu-quantity-control">
               {/* Tombol Hapus di sebelah kiri */}
               <button className="menu-button-remove" onClick={() => this.removeFromCart(menu)}>
                   <i className="fas fa-trash-alt"></i>
               </button>
               {/* Tombol Kurangi */}
               <button className="menu-button-quantity" onClick={() => this.decreaseQuantity(menu)}>
                   <i className="fas fa-minus"></i>
               </button>
               {/* Tampilkan jumlah */}
               <span className="menu-quantity">{cart.find((item) => item.id === menu.id).quantity}</span>
               {/* Tombol Tambah */}
               <button className="menu-button-quantity" onClick={() => this.increaseQuantity(menu)}>
                   <i className="fas fa-plus"></i>
               </button>
           </div>
           
            ) : (
                <button
                    className={`menu-button ${menu.stok > 0 ? "" : "disabled"}`}
                    disabled={menu.stok <= 0}
                    onClick={() => this.addToCart(menu)}
                >
                    Tambah
                </button>
            )}
        </div>
                            </div>
                        ))}
                    </div>
                )}


                  
{/* Konten Tab Pesanan */}
{activeTab === 'pesanan' && !showForm && (
    <div className="pesanan-wraper"> 
    <div className="pesanan-list">
        <h2 className="pesanan-anda">Pesanan Anda</h2>
        {pesanan.daftar_item && pesanan.daftar_item.length > 0 ? (
            <>
                {/* Nama Pemesan dan Waktu */}
                <div className="pesanan-header">
                    <span className="pesanan-nama">Nama: {pesanan.nama_pemesan}</span>
                    <span className="pesanan-waktu">Waktu: {new Date(pesanan.timestamp).toLocaleString()}</span>
                    <span className="pesanan-meja">No. Meja: {pesanan.no_meja}</span> {/* Menambahkan No. Meja */}
                </div>

                   {/* Status Pesanan */}
                   <div className="pesanan-status">
                    <span className={`status-text ${pesanan.diproses ? "sedang diproses" : "dimeja"}`}>
                       Status : {pesanan.diproses ? "Sedang Diproses" : "Sudah Di Meja"}
                    </span>
                </div>

                {/* Mengelompokkan item dengan id_menu yang sama */}
                {pesanan.daftar_item.reduce((acc, item) => {
                    // Cek jika item dengan id_menu yang sama sudah ada dalam accumulator
                    const existingItem = acc.find(i => i.id_menu === item.id_menu);
                    if (existingItem) {
                        existingItem.jumlah += item.jumlah;  // Jika ada, tambahkan jumlahnya
                    } else {
                        acc.push({ ...item });  // Jika belum ada, tambahkan item baru
                    }
                    return acc;  // Kembalikan accumulator
                }, []).map((item, index) => {
                    // Mencari data menu berdasarkan id_menu dari pesanan
                    const menu = menus.find(menu => menu.id === item.id_menu);

                    return menu ? (
                        <div key={index} className="pesanan-item">
                            <div className="pesanan-item-image">
                                <img src={menu.img_uri} alt={menu.nama} className="menu-image" />
                            </div>
                            <div className="pesanan-item-info">
                                <span className="pesanan-item-name">
                                    {menu.nama} x{item.jumlah}
                                </span>
                                <span className="pesanan-item-price">
                                    Rp {(item.jumlah * menu.harga).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div key={index} className="pesanan-item">
                            <span className="pesanan-item-name">Menu Tidak Ditemukan</span>
                        </div>
                    );
                })}

                {/* Total Harga */}
                <div className="pesanan-total">
                    <strong>Total: </strong>
                    <span>Rp {pesanan.total_harga.toLocaleString()}</span>
                </div>
            </>
        ) : (
            <p className="pesanan-anda">Belum ada pesanan.</p>
        )}
    </div>
    </div>
)}


                {/* Form pengisian data pemesan */}
                {showForm && (
                    <div className="form-wrapper">
                        <div className="form-container">
                        <div className="form-header">
                            <button 
                               className="back-button" 
                                 onClick={this.handleBackClick}
                                 >
                                  <i className="fas fa-arrow-left"></i> Kembali
                             </button>
                             <h1>Info Pemesan</h1>

                               {/* Loading Indicator */}

                        {isLoading && (
                            <div className="loading-overlay">
                                <div className="loading-spinner">
                                    <i className="fas fa-spinner fa-spin"></i> Memproses pesanan...
                                </div>
                            </div>
                        )}

                        </div>
                            <form onSubmit={this.completeOrder} className="order-form">
                                <div className="form-group">
                                    <label>Nama:</label>
                                    <input
                                        type="text"
                                        value={nama}
                                        onChange={(e) => this.setState({ nama: e.target.value })}
                                        required
                                        className="form-input"
                                        placeholder="Masukkan nama Anda"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>No. Meja:</label>
                                    <input
                                        type="text"
                                        value={no_meja}
                                        onChange={(e) => this.setState({ no_meja: e.target.value })}
                                        required
                                        className="form-input"
                                        placeholder="Masukkan nomor meja"
                                    />
                                </div>

                                <h2>Detail Pesanan</h2>
                                <div className="order-summary">
                                    {cart.map((item, index) => (
                                        <div key={index} className="summary-item">
                                            <span className="summary-item-name">
                                                {item.nama} x {item.quantity}
                                            </span>
                                            <span className="summary-item-price">
                                                Rp {(item.harga * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="summary-total">
                                        <strong>Total:</strong>
                                        <span>Rp {cart.reduce((total, item) => total + item.harga * item.quantity, 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button type="submit" className="form-submit-button">
                                    Pesan Sekarang
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Footer */}
                {activeTab === 'menu' && !showForm && (
                    <footer className="menu-footer">
                        <p>
                            Total:{" "}
                            <span>
                                Rp{" "}
                                {cart.reduce(
                                    (total, item) => total + item.harga * item.quantity,
                                    0
                                ).toLocaleString()}
                            </span>
                        </p>
                        <button
                            className="footer-button"
                            onClick={this.handlePesanClick}
                        >
                            Pesan
                        </button>
                    </footer>
                )}
            </div>
        );
    }
}

const reduxState =  (state) => ({
    userData: state.user,
    menus: state.menus,
    pesanan : state.pesanan
})

const reduxDispatch = (dispatch) => ({
    getMenus: () => dispatch(getDataFromAPI()),
    addPesanan: (data) => dispatch(addDataToAPI(data)),
    getPesanan: (uuid) => dispatch(getPesananByUUID(uuid)),
    updateStock: (menuUpdates) => dispatch(updateMenuStock(menuUpdates)), // Tambahkan ini
}) 

export default connect(reduxState, reduxDispatch) (Dasboard);