import axios from "axios";
import React from "react";

const OrdersContext = React.createContext();

const rootReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_ORDERS":
      return {
        isLoaded: true,
        orders: action.payload,
        total: action.total,
        images: state.images ? state.images : [],
      };
    case "EDIT_ORDER":
      const index = action.payload.id;
      return {
        ...state,
        isLoaded: true,
        orders: state.orders.map(c => {
          if (c.id === index) {
            return { ...c, ...action.payload };
          }
          return c;
        }),
      };

    case "GET_IMAGES":
      return {
        ...state,
        images: action.payload,
      };

    case "CREATE_ORDER":
      state.orders.push(action.payload);
      return {
        ...state,
        isLoaded: true,
        orders: state.orders,
      };

    default:
      return {
        ...state,
      };
  }
};

const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = React.useReducer(rootReducer, {
    isLoaded: false,
    orders: [],
    total: 0,
    isDateChange: false,
  });
  return (
    <OrdersContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrdersContext.Provider>
  );
};

const useOrdersState = () => {
  const context = React.useContext(OrdersContext);
  return context;
};

export function getOrdersRequest(
  dispatch,
  page,
  limit,
  ord,
  orderBy,
  query = "",
  status = false,
) {
  const order = ord === "asc" ? 1 : -1;

  return axios
    .get(
      `/admin/orders?page=${page}&limit=${limit}&order=${order}&orderBy=${orderBy}&query=${query}&status=${status}`,
    )
    .then(res => {
      console.log(res.data);
      dispatch({
        type: "UPDATE_ORDERS",
        payload: res.data.orders,
        total: res.data.total,
      });
    })
    .catch(ex => {
      console.log(ex.response);
    });
}

export function rejectOrderRequest({ id, history, dispatch }) {
  axios.post("/orders/reject/" + id).then(res => {
    getOrdersRequest(dispatch);
    if (history.location.pathname !== "/app/orders")
      history.push("/app/orders");
    return;
  });

  getOrdersRequest(dispatch);
}

export function verifyOrderRequest({ id, history, dispatch }) {
  axios
    .post("/admin/orders/verify/" + id)
    .then(res => {
      getOrdersRequest(dispatch);
      if (history.location.pathname !== "/app/orders")
        history.push("/app/orders");
      return;
    })
    .catch(ex => {
      console.log(ex.response);
    });
  getOrdersRequest(dispatch);
}

export function getOrderInfo(dispatch) {
  axios.get("/orders").then(res => {
    dispatch({ type: "UPDATE_ORDERS", payload: res.data });
  });
}

export function updateOrder(ad, dispatch) {
  axios.put("/orders/" + ad.id, ad).then(res => {
    dispatch({ type: "EDIT_ORDER", payload: res.data });
  });
}

export function createOrder(ad, dispatch) {
  axios.post("/orders", ad).then(res => {
    dispatch({ type: "CREATE_ORDER", payload: res.data });
  });
}

export function getOrdersImages(dispatch) {
  const replacer = data => {
    return data.map(c => {
      return c.replace(
        /http:\/\/.+\//,
        "https://flatlogic-node-backend.herokuapp.com/assets/orders/",
      );
    });
  };

  axios.get("/orders/images-list").then(res => {
    dispatch({ type: "GET_IMAGES", payload: replacer(res.data) });
  });
}

export { OrdersProvider, OrdersContext, useOrdersState };
