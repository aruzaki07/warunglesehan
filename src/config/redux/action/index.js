
import firebase, { db } from "../../firebase";
import {updateDoc, arrayUnion, doc, setDoc, getDoc, getDocs, collection , onSnapshot, query, where,} from "firebase/firestore"; 



export const getDataFromAPI = () => (dispatch) => {
    const docRef = collection(db, "menus");
    return new Promise((resolve, reject) => {
      onSnapshot(docRef, (snapshot) => {
        // Mengakses seluruh dokumen yang ada dalam snapshot
        const menusData = snapshot.docs.map((doc) => ({
          id: doc.id, // Ambil ID dokumen
          ...doc.data(), // Ambil data dokumen
        }));
    
        // console.log("Current menus data: ", menusData);
        // Dispatch data ke Redux jika diperlukan
  
        dispatch({type: 'SET_MENUS', value: menusData })
        resolve(menusData)
    });
    })
  
  }

  export const getPesananByUUID = (uuid) => (dispatch) => {
    const docRef = doc(db, "pesanan", uuid); // Menggunakan uuid sebagai ID dokumen
    const unsub = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        // console.log("Pesanan data: ", docSnapshot.data());
        // Dispatch data ke Redux jika diperlukan
        dispatch({ type: 'SET_PESANAN', value: docSnapshot.data() });
      } else {
        // console.log("Pesanan tidak ditemukan!");
      }
    });
  
    return unsub; // Membatalkan pemantauan ketika diperlukan
  }

  
  export const addDataToAPI = (data) => async (dispatch) => {
    // Referensi ke dokumen yang ingin kita cek
    const docRef = doc(db, "pesanan", data.id_pesanan);
    
    try {
      // Cek apakah dokumen sudah ada
      const docSnapshot = await getDoc(docRef);
      
      if (docSnapshot.exists()) {
        // Jika dokumen ada, ambil data yang sudah ada
        const existingData = docSnapshot.data();
        
        // Tambahkan daftar_item baru ke daftar_item yang sudah ada
        const updatedDaftarItem = [
          ...existingData.daftar_item,
          ...data.daftar_item  // Menambahkan daftar item baru ke daftar item yang sudah ada
        ];
  
        // Hitung total harga untuk data yang baru
        const newTotalHarga = data.total_harga;
    
        // Hitung total_harga yang baru dengan menambahkan total harga lama dan total harga baru
        const updatedTotalHarga = existingData.total_harga + newTotalHarga;
  
        // Update dokumen yang ada
        await updateDoc(docRef, {
          daftar_item: updatedDaftarItem,
          diproses: data.diproses,
          id_pesanan: data.id_pesanan,
          nama_pemesan: data.nama_pemesan,
          no_meja: data.no_meja,
          timestamp: data.timestamp,
          total_harga: updatedTotalHarga
        }, { merge: true }); // Gunakan merge: true agar tidak menimpa data lainnya
      } else {
        // Jika dokumen tidak ada, buat dokumen baru
        // const totalHarga = data.daftar_item.reduce((total, item) => total + (item.harga * item.jumlah), 0);
  
        await setDoc(docRef, {
          daftar_item: data.daftar_item,
          diproses: data.diproses,
          id_pesanan: data.id_pesanan,
          nama_pemesan: data.nama_pemesan,
          no_meja: data.no_meja,
          timestamp: data.timestamp,
          total_harga: data.total_harga
        });
      }
  
      // console.log("Pesanan berhasil disimpan atau diperbarui.");
    } catch (error) {
      console.error("Error saat menyimpan atau memperbarui pesanan:", error);
    }
  };


  export const updateMenuStock = (menuUpdates) => async (dispatch) => {
    try {
      const updates = menuUpdates.map(async (menu) => {
        const menuRef = doc(db, "menus", menu.id); // Referensi ke dokumen menu berdasarkan ID
        const docSnapshot = await getDoc(menuRef); // Ambil data dokumen
  
        if (docSnapshot.exists()) {
          const currentStock = docSnapshot.data().stok || 0; // Ambil stok saat ini
          const newStock = currentStock - menu.quantity; // Hitung stok baru
  
          if (newStock >= 0) {
            // Update stok di Firestore
            await updateDoc(menuRef, {
              stok: newStock,
            });
  
            // console.log(`Stok untuk menu ${menu.id} berhasil diperbarui.`);
          } else {
            console.warn(`Stok untuk ${menu.id} tidak mencukupi!`);
          }
        } else {
          console.warn(`Menu dengan ID ${menu.id} tidak ditemukan!`);
        }
      });
  
      await Promise.all(updates); // Tunggu semua proses update selesai
  
      // Dispatch Redux jika ada perubahan state yang diperlukan
      // dispatch({ type: "UPDATE_MENU_STOCK_SUCCESS", payload: menuUpdates });
    } catch (error) {
      // console.error("Error updating menu stock:", error);
  
      // Dispatch Redux jika ada error
      // dispatch({ type: "UPDATE_MENU_STOCK_FAILURE", error });
    }
  };
  
