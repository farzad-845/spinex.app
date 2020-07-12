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
import Autocomplete from "@material-ui/lab/Autocomplete";

import axios from "axios";
import React from "react";
import { withRouter } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import Notification from "../../components/Notification";
import Widget from "../../components/Widget";
import { Button, Typography } from "../../components/Wrappers";
import useStyles from "./styles";

function FormsElements() {
  const classes = useStyles();

  var promise = Promise.resolve();
  const [items, setItems] = React.useState([]);
  //const [providers, setProviders] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const loading = open && options.length === 0;
  const [providerDetail, setProviderDetail] = React.useState({
    name: "",
    code: "",
    image: null,
  });
  const [
    reqAddProviderToItemCode,
    AddDataToReqAddProviderToItemCode,
  ] = React.useState({
    _ids: [],
    itemIds: [],
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

  const handleAddNewProvider = async () => {
    setIsLoading(true);
    const errors = [];
    const { name, code, image } = providerDetail;
    if (name.length < 2) errors.push("name length must be > 2.");
    if (code.length < 2) errors.push("code length must be > 2.");
    if (!image) errors.push("you should select at least one image.");
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
      formData.append("code", code);
      formData.append("name", name);
      await axios.post("/admin/providers/add", formData);
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

  const handleAddItemToProvider = async () => {
    setIsLoading(true);
    const errors = [];
    const { _ids, itemIds } = reqAddProviderToItemCode;
    if (_ids.length < 1) errors.push("you should select at least one provider");
    if (itemIds.length < 1) errors.push("you should select at least one item.");
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
      const body = { _ids, itemIds };
      await axios.post("/admin/providers/item", body);
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

  React.useEffect(() => {
    let active = true;

    if (!loading) return undefined;

    (async () => {
      const response = await axios.get("/admin/providers/item");
      const { providers, items } = response.data;
      if (active) setOptions(items);
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  React.useEffect(() => {
    if (!open) setOptions([]);
  }, [open]);

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
            title="Add New Provider"
            bodyClass={classes.horizontalFormTop}
            disableWidgetMenu
            inheritHeight
          >
            <Grid container direction={"column"} spacing={3}>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3} md={3}>
                  <Typography variant={"body1"}>Name</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Input
                    id="component-helper2"
                    aria-describedby="component-helper-text"
                    style={{ width: "100%" }}
                    onChange={e =>
                      setProviderDetail({
                        ...providerDetail,
                        name: e.target.value,
                      })
                    }
                  />
                  <FormHelperText id="component-helper-text">
                    Name Of Provider
                  </FormHelperText>
                </Grid>
              </Grid>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3} md={3}>
                  <Typography variant={"body1"}>code</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Input
                    id="component-helper2"
                    aria-describedby="component-helper-text"
                    style={{ width: "100%" }}
                    onChange={e =>
                      setProviderDetail({
                        ...providerDetail,
                        code: e.target.value,
                      })
                    }
                  />
                  <FormHelperText id="component-helper-text">
                    Code Of Provider
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
                      onClick={e => handleAddNewProvider()}
                    >
                      Add Provider
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
            title="Add Items To Providers"
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
                  <Autocomplete
                    id="asynchronous-demo"
                    style={{ width: 300 }}
                    open={open}
                    onOpen={() => {
                      setOpen(true);
                    }}
                    onClose={() => {
                      setOpen(false);
                    }}
                    getOptionSelected={(option, value) =>
                      option.name === value.name
                    }
                    getOptionLabel={option => option.name}
                    options={options}
                    loading={loading}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="Asynchronous"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {loading ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                  />
                  );
                </Grid>
              </Grid>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3} md={3}>
                  <Typography variant={"body1"}>Providers</Typography>
                </Grid>
                <Grid item xs={6}></Grid>
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
                      onClick={e => handleAddItemToProvider()}
                    >
                      Add Items To Providers
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
