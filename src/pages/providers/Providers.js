import "react-toastify/dist/ReactToastify.css";

import React from "react";
import axios from "axios";
import MUIDataTable from "mui-datatables";

import { withRouter } from "react-router-dom";
import { Typography } from "../../components/Wrappers";
import { CircularProgress, Grid } from "@material-ui/core";

function FormsElements() {
  const [isTableLoading, setIsTableLoading] = React.useState(false);
  const [itemsData, setItemsData] = React.useState([]);

  const fetchItemsData = async () => {
    setIsTableLoading(true);
    try {
      const res = await axios.get("/admin/providers");
      const { data } = res.data;
      setItemsData(data);
      setIsTableLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    fetchItemsData();
  }, []);

  const columns = [
    {
      name: "name",
      label: "Name",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "totalUsers",
      label: "Users",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "numberOfVideos",
      label: "Videos",
      options: {
        filter: false,
        sort: true,
      },
    },
  ];

  const options = {
    download: false,
    print: false,
    search: false,
    selectableRows: "none",
    serverSide: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [10],
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MUIDataTable
            title={
              <Typography>
                providers
                {isTableLoading && (
                  <CircularProgress
                    size={24}
                    style={{ marginLeft: 15, position: "relative", top: 4 }}
                  />
                )}
              </Typography>
            }
            data={itemsData}
            columns={columns}
            options={options}
          />
        </Grid>
      </Grid>
    </>
  );
}

export default withRouter(FormsElements);
