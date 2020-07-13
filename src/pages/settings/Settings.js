import "react-toastify/dist/ReactToastify.css";

import axios from "axios";
import React from "react";

import Grid from "@material-ui/core/Grid";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import CircularProgress from "@material-ui/core/CircularProgress";

import CloseIcon from "@material-ui/icons/Close";

import { withRouter } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import Widget from "../../components/Widget";
import Notification from "../../components/Notification";
import { Button, Typography } from "../../components/Wrappers";

import useStyles from "./styles";

function FormsElements() {
  const [btnsLoadingState, setBtnLoadingState] = React.useState({
    1: false,
    2: false,
    3: false,
  });

  const [updateUserData, setDataForUpdatedUser] = React.useState({
    token: "",
    _id: "",
  });

  const classes = useStyles();

  const updateUserInDatabase = async () => {
    setBtnLoadingState({ ...btnsLoadingState, 1: true });
    try {
      const { _id, token } = updateUserData;
      if (token.length <= 2 || _id.length <= 6)
        throw new Error("not valid Data");
      await axios.post("/admin/updateUser", { token, _id });
      sendNotification();
      setDataForUpdatedUser({ token: "", _id: "" });
    } catch (ex) {
      sendNotification({ message: ex.toString(), color: "secondary" });
    } finally {
      setBtnLoadingState({ ...btnsLoadingState, 1: false });
    }
  };

  return (
    <>
      <Grid container spacing={6}>
        <ToastContainer
          className={classes.toastsContainer}
          closeButton={
            <CloseButton className={classes.notificationCloseButton} />
          }
          closeOnClick={false}
          progressClassName={classes.notificationProgress}
        />
        <Grid item md={6} xs={12} lg={6}>
          <Widget
            title="update user in db"
            bodyClass={classes.horizontalFormTop}
            disableWidgetMenu
            inheritHeight
          >
            <Grid container direction={"column"} spacing={3}>
              <Grid item container alignItems={"center"}>
                <Grid item xs={6}>
                  <Typography variant={"body1"}>Id</Typography>
                </Grid>
                <Grid xs={6} item>
                  <Input
                    id="component-helper2"
                    aria-describedby="component-helper-text"
                    value={updateUserData.token}
                    onChange={e =>
                      setDataForUpdatedUser({
                        ...updateUserData,
                        token: e.target.value,
                      })
                    }
                    style={{ width: "100%" }}
                  />
                  <FormHelperText id="component-helper-text">
                    Id of user
                  </FormHelperText>
                </Grid>
              </Grid>
              <Grid item container alignItems={"center"}>
                <Grid item xs={6}>
                  <Typography variant={"body1"}>token</Typography>
                </Grid>
                <Grid xs={6} item>
                  <Input
                    id="component-helper2"
                    aria-describedby="component-helper-text"
                    value={updateUserData.token}
                    onChange={e =>
                      setDataForUpdatedUser({
                        ...updateUserData,
                        token: e.target.value,
                      })
                    }
                    style={{ width: "100%" }}
                  />
                  <FormHelperText id="component-helper-text">
                    amount of tokens
                  </FormHelperText>
                </Grid>
              </Grid>
              <Grid item container>
                <Grid item>
                  {btnsLoadingState[1] ? (
                    <CircularProgress size={26} />
                  ) : (
                    <Button
                      variant={"contained"}
                      color={"primary"}
                      onClick={e => updateUserInDatabase()}
                      style={{ marginRight: 8 }}
                    >
                      Update
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

  // #############################################################
  function sendNotification(notification_options = {}) {
    const {
      message = "successful operation",
      color = "success",
      type_option = "info",
      type_componentProps = "feedback",
    } = notification_options;
    const componentProps = {
      type_componentProps,
      message,
      variant: "contained",
      color,
    };
    const options = {
      type_option,
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
}

// #############################################################
function CloseButton({ closeToast, className }) {
  return <CloseIcon className={className} onClick={closeToast} />;
}

export default withRouter(FormsElements);
