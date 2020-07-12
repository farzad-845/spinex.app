import "react-toastify/dist/ReactToastify.css";

import {
  CircularProgress,
  Divider,
  FormHelperText,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField as Input,
  TextField,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@material-ui/icons";

import axios from "axios";
import ChipInput from "material-ui-chip-input";
import React from "react";
import { withRouter } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import Notification from "../../components/Notification";
import Widget from "../../components/Widget";
import { Button, Typography } from "../../components/Wrappers";
import useStyles from "./styles";

const types = [
  {
    id: 0,
    value: "product",
  },
  {
    id: 1,
    value: "code",
  },
  {
    id: 2,
    value: "cash",
  },
];

function FormsElements() {
  const classes = useStyles();

  var promise = Promise.resolve();
  const [isLoading, setIsLoading] = React.useState(false);
  const [codeItems, setCodeItems] = React.useState([]);
  const [data, setData] = React.useState({
    title: "",
    description: "",
    type: "product",
    amount: 0,
    token: 0,
    image: null,
  });
  const [codeData, setCodeData] = React.useState({
    _id: "",
    value: "",
    codes: [],
    expire_at: new Date(),
  });

  function sendNotification(notification_options = {}) {
    const {
      message = "successful operation",
      color = "success",
      type_option = "info",
      type_componentProps = "feedback",
    } = notification_options;
    const componentProps = {
      type: type_componentProps,
      message,
      variant: "contained",
      color,
    };
    const options = {
      type: type_option,
      position: toast.POSITION.TOP_RIGHT,
      progressClassName: classes.progress,
      className: classes.notification,
      timeOut: 1000,
    };
    return toast(
      <Notification
        {...componentProps}
        className={classes.notificationComponent}
      />,
      options,
    );
  }

  const handleTypeChange = e => setData({ ...data, type: e.target.value });
  const handleCodeAdded = chips => setData({ ...data, codes: chips });

  const handleValuesChange = e =>
    setData({
      ...data,
      [e.target.id.toLowerCase()]: e.target.value,
    });

  const handleCodeItemChange = e =>
    setCodeData({
      ...codeData,
      _id: codeItems.filter(c => c.value === e.target.value)[0].id,
      value: e.target.value,
    });

  const handleAddNewItem = async () => {
    setIsLoading(true);
    const errors = [];
    const { title, description, image, type, amount, token } = data;
    if (title.length < 2) errors.push("title length must be > 2.");
    if (description.length < 2) errors.push("description length must be > 2.");
    if (!image) errors.push("you should select at least one image.");
    if (token === 0 || amount === 0)
      errors.push("your values should be bigger than zero.");
    if (errors.length > 0) {
      errors.forEach(err => {
        promise = promise.then(function() {
          sendNotification({ message: err, color: "secondary" });
          return new Promise(resolve => {
            setTimeout(resolve, 1000);
          });
        });
      });
      setIsLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("description", description);
      formData.append("type", type);
      formData.append("amount", amount);
      formData.append("token", token);
      formData.append("title", title);
      await axios.post("/admin/items", formData);
      sendNotification({
        message: "category added successfully",
        color: "primary",
      });
      setIsLoading(false);
    } catch (ex) {
      sendNotification({
        message: "an error has been occurred when try to add category",
        color: "secondary",
      });
      setIsLoading(false);
    }
  };

  const handleAddDiscountCodes = async () => {
    setIsLoading(true);
    const errors = [];
    const { _id, codes, expire_at } = codeData;
    if (_id.length < 8) errors.push("item should be valid.");
    if (codes.length < 1)
      errors.push("you should enter at least one discount code.");
    if (expire_at < +new Date() + 10 * 60 * 1000)
      errors.push("expire date should bigger than one month.");
    if (errors.length > 0) {
      errors.forEach(err => {
        promise = promise.then(function() {
          sendNotification({ message: err, color: "secondary" });
          return new Promise(resolve => {
            setTimeout(resolve, 1000);
          });
        });
      });
      setIsLoading(false);
      return;
    }
    try {
      const body = { _id, codes, expire_at };
      await axios.post("/admin/items/codes", body);
      sendNotification({
        message: "category added successfully",
        color: "primary",
      });
      setIsLoading(false);
    } catch (ex) {
      sendNotification({
        message: "an error has been occurred when try to add category",
        color: "secondary",
      });
      setIsLoading(false);
    }
  };

  const fetchItemsData = async () => {
    try {
      const res = await axios.get("/admin/items");
      const { code } = res.data;
      setCodeItems(
        code.map(c => {
          return {
            id: c._id,
            value: c.title,
          };
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    fetchItemsData();
  }, []);

  return (
    <>
      <Grid container spacing={3}>
        <ToastContainer
          className={classes.toastsContainer}
          closeButton={
            <CloseButton className={classes.notificationCloseButton} />
          }
          closeOnClick={false}
          progressClassName={classes.notificationProgress}
        />
        <Grid item md={12} xs={12}>
          <Widget
            title="Add New Item"
            bodyClass={classes.horizontalFormTop}
            disableWidgetMenu
            inheritHeight
          >
            <Grid container direction={"column"} spacing={3}>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3} md={3}>
                  <Typography variant={"body1"}>Title</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Input
                    id="component-helper2"
                    aria-describedby="component-helper-text"
                    style={{ width: "100%" }}
                    onChange={e => setData({ ...data, title: e.target.value })}
                  />
                  <FormHelperText id="component-helper-text">
                    Title Of Item
                  </FormHelperText>
                </Grid>
              </Grid>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3} md={3}>
                  <Typography variant={"body1"}>Description</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Input
                    id="component-helper2"
                    aria-describedby="component-helper-text"
                    style={{ width: "100%" }}
                    onChange={e =>
                      setData({ ...data, description: e.target.value })
                    }
                  />
                  <FormHelperText id="component-helper-text">
                    Description Of Item
                  </FormHelperText>
                </Grid>
              </Grid>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3} md={3}>
                  <Typography variant={"body1"}>Type</Typography>
                </Grid>
                <Grid item container alignItems={"center"} xs={6}>
                  <SelectPlace
                    value={data.type}
                    onChange={handleTypeChange}
                    items={types}
                  />
                </Grid>
              </Grid>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3} md={3}>
                  <Typography variant={"body1"}>Values</Typography>
                </Grid>
                <Grid item container alignItems={"center"} xs={6}>
                  <Grid item xs={6}>
                    <PriceInput
                      textHelper={"token"}
                      onChange={handleValuesChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <PriceInput
                      textHelper={"amount"}
                      onChange={handleValuesChange}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3}>
                  <Typography variant={"body1"}>
                    Image
                    <Typography variant="caption">{` (just svg)`}</Typography>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <input
                    accept="image/svg+xml"
                    style={{ display: "none" }}
                    id="contained-button-file"
                    multiple
                    type="file"
                    onChange={e =>
                      setData({
                        ...data,
                        image: e.target.files[0],
                      })
                    }
                  />
                  <label htmlFor="contained-button-file">
                    <Button
                      color="primary"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                    >
                      Upload
                    </Button>
                  </label>
                </Grid>
              </Grid>
              <Grid item container justify="flex-end">
                <Grid item>
                  {isLoading ? (
                    <CircularProgress size={26} />
                  ) : (
                    <Button
                      variant={"contained"}
                      color={"primary"}
                      style={{ marginRight: 8 }}
                      onClick={e => handleAddNewItem()}
                    >
                      Add Item
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Widget>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <ToastContainer
          className={classes.toastsContainer}
          closeButton={
            <CloseButton className={classes.notificationCloseButton} />
          }
          closeOnClick={false}
          progressClassName={classes.notificationProgress}
        />
        <Grid item md={12} xs={12}>
          <Widget
            title="Add Discount Codes"
            bodyClass={classes.horizontalFormTop}
            disableWidgetMenu
            inheritHeight
          >
            <Grid container direction={"column"} spacing={3}>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3} md={3}>
                  <Typography variant={"body1"}>Item</Typography>
                </Grid>
                <Grid item container alignItems={"center"} xs={6}>
                  <SelectPlace
                    value={codeData.value}
                    onChange={handleCodeItemChange}
                    items={codeItems}
                  />
                </Grid>
              </Grid>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3} md={3}>
                  <Typography variant={"body1"}>Discount Codes</Typography>
                </Grid>
                <Grid item xs={6}>
                  <ChipInput
                    style={{ width: "100%" }}
                    defaultValue={[]}
                    onChange={chips => handleCodeAdded(chips)}
                  />
                  <FormHelperText id="component-helper-text">
                    After Each Code Press Enter
                  </FormHelperText>
                </Grid>
              </Grid>
              <Grid item container justify="flex-end">
                <Grid item>
                  {isLoading ? (
                    <CircularProgress size={26} />
                  ) : (
                    <Button
                      variant={"contained"}
                      color={"primary"}
                      style={{ marginRight: 8 }}
                      onClick={e => handleAddDiscountCodes()}
                    >
                      Add Codes
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Widget>
        </Grid>
      </Grid>
    </>
  );
}

// #############################################################
function CloseButton({ closeToast, className }) {
  return <CloseIcon className={className} onClick={closeToast} />;
}

const PriceInput = ({ textHelper, onChange }) => {
  return (
    <>
      <TextField
        type="number"
        id={textHelper.split(" ")[0]}
        style={{ width: "90%" }}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
        onChange={onChange}
      />
      <FormHelperText id="component-helper-text">{textHelper}</FormHelperText>
    </>
  );
};

const SelectPlace = ({ value, onChange, items }) => {
  return (
    <Select
      labelId="demo-simple-select-label"
      id="demo-simple-select"
      value={value}
      onChange={onChange}
      style={{ width: "90%" }}
    >
      {items.map(c =>
        c.type === "divider" ? (
          <Divider key={c.id} />
        ) : (
          <MenuItem value={c.value} key={c.id}>
            {c.value}
          </MenuItem>
        ),
      )}
    </Select>
  );
};

export default withRouter(FormsElements);
