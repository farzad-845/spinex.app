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
  Check as CheckIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@material-ui/icons";
import useAutocomplete from "@material-ui/lab/useAutocomplete";
import NoSsr from "@material-ui/core/NoSsr";

import styled from "styled-components";
import axios from "axios";
import React from "react";
import { withRouter } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import Notification from "../../components/Notification";
import Widget from "../../components/Widget";
import { Button, Typography } from "../../components/Wrappers";
import useStyles from "./styles";

const Label = styled("label")`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`;

const InputWrapper = styled("div")`
  width: 100%;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;

  &:hover {
    border-color: #40a9ff;
  }

  &.focused {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  & input {
    font-size: 14px;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 6px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`;

const Tag = styled(({ label, onDelete, ...props }) => (
  <div {...props}>
    <span>{label}</span>
    <CloseIcon onClick={onDelete} />
  </div>
))`
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: #40a9ff;
    background-color: #e6f7ff;
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
  }
`;

const Listbox = styled("ul")`
  width: 300px;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: #fff;
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected="true"] {
    background-color: #fafafa;
    font-weight: 600;

    & svg {
      color: #1890ff;
    }
  }

  & li[data-focus="true"] {
    background-color: #e6f7ff;
    cursor: pointer;

    & svg {
      color: #000;
    }
  }
`;

function FormsElements() {
  const classes = useStyles();

  var promise = Promise.resolve();
  const [items, setItems] = React.useState([]);
  const [providers, setProviders] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [password, setPassword] = React.useState(null);
  const [providerDetail, setProviderDetail] = React.useState({
    name: "",
    code: "",
    image: null,
  });
  const [
    reqAddProviderToItemCode,
    AddDataToReqAddProviderToItemCode,
  ] = React.useState({
    name: "",
    _ids: [],
  });

  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    id: "customized-hook-demo",
    multiple: true,
    options: items,
    getOptionLabel: option => option.title,
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
  const handleProvidersChange = e =>
    AddDataToReqAddProviderToItemCode({
      ...reqAddProviderToItemCode,
      _ids: [providers.filter(pr => pr.value === e.target.value)[0].id],
      name: e.target.value,
    });

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
      const response = await axios.post("/admin/providers/add", formData);
      sendNotification({
        message: "provider added successfully",
        color: "primary",
      });
      console.log(response.data);
      setPassword(response.data.password);
      fetchItemsData();
      setIsLoading(false);
    } catch (ex) {
      console.error(ex.response);
      sendNotification({
        message: "an error has been occurred when try to add provider",
        color: "secondary",
      });
      setIsLoading(false);
    }
  };

  const handleAddItemToProvider = async () => {
    setIsLoading(true);
    const errors = [];
    const { _ids } = reqAddProviderToItemCode;
    if (_ids.length !== 1) errors.push("you should select one provider");
    if (value.length < 1) errors.push("you should select at least one item.");
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
      const body = { _ids, itemsId: value.map(val => val._id) };
      await axios.post("/admin/providers/item", body);
      sendNotification({
        message: "items added successfully to provider",
        color: "primary",
      });
      setIsLoading(false);
    } catch (ex) {
      sendNotification({
        message: "an error has been occurred when try to add items to provider",
        color: "secondary",
      });
      console.log(ex.response.data);
      setIsLoading(false);
    }
  };

  const fetchItemsData = async () => {
    try {
      const res = await axios.get("/admin/providers/item");
      const { providers, items } = res.data;
      setProviders(
        providers.map(p => {
          return { id: p.code, value: p.name };
        }),
      );
      setItems(items);
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
                      setProviderDetail({
                        ...providerDetail,
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
              {password && (
                <Grid item container alignItems={"center"} justify="center">
                  <Grid item xs={3} md={3}>
                    <Typography variant={"body1"}>Password</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant={"body1"}>{password}</Typography>
                    <FormHelperText id="component-helper-text">
                      password of provider
                    </FormHelperText>
                  </Grid>
                </Grid>
              )}
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
                  <Typography variant={"body1"}>Providers</Typography>
                </Grid>
                <Grid item xs={6}>
                  <SelectPlace
                    value={reqAddProviderToItemCode.name}
                    onChange={handleProvidersChange}
                    items={providers}
                  />
                </Grid>
              </Grid>
              <Grid item container alignItems={"center"} justify="center">
                <Grid item xs={3} md={3}>
                  <Typography variant={"body1"}>Item</Typography>
                </Grid>
                <Grid item container alignItems={"center"} xs={6}>
                  <NoSsr>
                    <div>
                      <div {...getRootProps()}>
                        <Label {...getInputLabelProps()}>Items</Label>
                        <InputWrapper
                          ref={setAnchorEl}
                          className={focused ? "focused" : ""}
                        >
                          {value.map((option, index) => (
                            <Tag
                              label={option.title}
                              {...getTagProps({ index })}
                            />
                          ))}

                          <input {...getInputProps()} />
                        </InputWrapper>
                      </div>
                      {groupedOptions.length > 0 ? (
                        <Listbox {...getListboxProps()}>
                          {groupedOptions.map((option, index) => (
                            <li {...getOptionProps({ option, index })}>
                              <span>{option.title}</span>
                              <CheckIcon fontSize="small" />
                            </li>
                          ))}
                        </Listbox>
                      ) : null}
                    </div>
                  </NoSsr>
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
