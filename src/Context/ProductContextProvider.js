import React, { createContext, useContext, useReducer } from "react";
import { ACTIONS, API } from "../helpers/consts";
import axios from "axios";
import { notify, notifyError } from "../Components/Toastify/Toastify";
import { useNavigate } from "react-router-dom";

export const productContext = createContext();

//! мы сами создали сами хук!!!
export const useProductContext = () => {
  return useContext(productContext);
};

const INIT_STATE = {
  products: [],
  forEditVal: null,
};

function reducer(state = INIT_STATE, action) {
  switch (action.type) {
    case ACTIONS.GET_PRODUCTS:
      return {
        ...state,
        products: action.payload,
      };
    case ACTIONS.GET_ONE_PRODUCT:
      return {
        ...state,
        forEditVal: action.payload,
      };
    default:
      return state;
  }
}

const ProductContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INIT_STATE);

  const navigate = useNavigate();

  const getProducts = async () => {
    try {
      let { data } = await axios.get(API);
      dispatch({
        type: ACTIONS.GET_PRODUCTS,
        payload: data,
      });
    } catch (err) {
      notifyError(err);
    }
  };

  const addProduct = async (newProduct) => {
    try {
      let res = await axios.post(API, newProduct);
      notify("success", `Продукт ${newProduct.title} был успешно добавлен`);
      navigate("/admin");
    } catch (err) {
      notifyError(err);
    }
  };

  const deleteProduct = async (prod) => {
    try {
      let res = await axios.delete(`${API}/${prod.id}`);
      notify("success", `Продукт ${prod.title} был удален`);
      getProducts();
    } catch (err) {
      notifyError(err);
    }
  };

  const getOneProduct = async (id) => {
    try {
      let { data } = await axios.get(`${API}/${id}`);
      dispatch({
        type: ACTIONS.GET_ONE_PRODUCT,
        payload: data,
      });
    } catch (err) {
      notifyError(err);
    }
  };

  const saveEditedProd = async (editedProd) => {
    try {
      let res = await axios.patch(`${API}/${editedProd.id}`, editedProd);
      notify("info", `Продукт ${editedProd.title} был успешно обновлен!`);
      getProducts();
      navigate("/admin");
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <productContext.Provider
      value={{
        products: state.products,
        forEditVal: state.forEditVal,
        addProduct,
        getProducts,
        deleteProduct,
        getOneProduct,
        saveEditedProd,
      }}
    >
      {children}
    </productContext.Provider>
  );
};

export default ProductContextProvider;