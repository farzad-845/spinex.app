import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField as Input,
  Toolbar,
  Tooltip,
} from "@material-ui/core";
import { lighten, makeStyles } from "@material-ui/core/styles";
// Material UI icons
import {
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from "@material-ui/icons";
import cn from "classnames";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";

// components
import Widget from "../../components/Widget";
import { Button, Typography } from "../../components/Wrappers";
//context
import {
  OrdersProvider,
  getOrdersRequest,
  rejectOrderRequest,
  useOrdersState,
  verifyOrderRequest,
} from "../../context/OrdersContext";
import useStyles from "./styles";

const headCells = [
  { id: "userId", numeric: false, disablePadding: false, label: "ID" },
  { id: "item", numeric: false, disablePadding: false, label: "Item" },
  { id: "type", numeric: false, disablePadding: false, label: "Type" },
  {
    id: "name",
    numeric: true,
    disablePadding: false,
    label: "Name",
  },
  { id: "phonenumber", numeric: true, disablePadding: false, label: "Phone" },
  { id: "data", numeric: true, disablePadding: false, label: "Data" },
  { id: "status", numeric: true, disablePadding: false, label: "Status" },
  {
    id: "actions",
    numeric: true,
    disablePadding: false,
    label: "Actions",
    sort: false,
  },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, rowCount, onRequestSort } = props;
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "left" : "right"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={order}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
  },
}));

const EnhancedTableToolbar = () => {
  const classes = useToolbarStyles();

  return (
    <Toolbar className={cn(classes.root)} style={{ marginTop: 8 }}>
      <Typography className={classes.title} variant="h6" id="tableTitle">
        Orders
      </Typography>
      <Tooltip title="Filter list">
        <IconButton aria-label="filter list">
          <FilterListIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
};

function OrdersPage({ history, value }) {
  const classes = useStyles();
  const context = useOrdersState();
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("");
  const [processed, setProcessed] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [backOrders, setBackOrders] = React.useState(context.orders.orders);
  const [total, setTotal] = React.useState(context.orders.total);
  const [search, setSearchValue] = React.useState("");

  useEffect(() => {
    setPage(0);
    getOrdersRequest(context.setOrders, 0, rowsPerPage, order, orderBy, search);
  }, [value]);

  useEffect(() => {
    setTotal(context.orders.total);
    if (context.orders.isDateChange && page == 0)
      return setBackOrders(context.orders.orders);
    const data = [...backOrders, ...context.orders.orders];
    const uniq = Array.from(new Map(data.map(e => [e._id, e])).values());
    setBackOrders(uniq);
  }, [context]);

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === "desc";
    const ord = isDesc ? "asc" : "desc";
    setOrder(ord);
    setOrderBy(property);
    setPage(0);
    setBackOrders([]);
    getOrdersRequest(context.setOrders, 0, rowsPerPage, ord, property, search);
  };

  const searchOrders = e => {
    const value = e.currentTarget.value;
    setPage(0);
    setBackOrders([]);
    setSearchValue(value);
    getOrdersRequest(context.setOrders, 0, rowsPerPage, order, orderBy, value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    getOrdersRequest(
      context.setOrders,
      newPage,
      rowsPerPage,
      order,
      orderBy,
      search,
    );
  };

  const handleChangeRowsPerPage = event => {
    const rows = parseInt(event.target.value, 10);
    setPage(0);
    setRowsPerPage(rows);
    getOrdersRequest(context.setOrders, 0, rows, order, orderBy, search);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, total - page * rowsPerPage);

  const verifyOrder = (id, history, event) => {
    verifyOrderRequest({ id, history, dispatch: context.setOrders });
    event.stopPropagation();
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Widget
            disableWidgetMenu
            header={
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                width={"100%"}
              >
                <Box display={"flex"} style={{ width: "calc(100% - 20px)" }}>
                  <Typography
                    variant="h6"
                    color="text"
                    colorBrightness={"secondary"}
                    noWrap
                  >
                    Orders
                  </Typography>
                  <Box alignSelf="flex-end" ml={1}>
                    <Typography
                      color="text"
                      colorBrightness={"hint"}
                      variant={"caption"}
                    >
                      {total} total
                    </Typography>
                  </Box>
                </Box>
                <Input
                  id="search-field"
                  className={classes.textField}
                  label="Search"
                  margin="dense"
                  variant="outlined"
                  InputProps={{
                    startOrderornment: (
                      <InputAdornment position="start">
                        <SearchIcon className={classes.searchIcon} />
                      </InputAdornment>
                    ),
                  }}
                  onChange={e => searchOrders(e)}
                />
              </Box>
            }
          >
            <EnhancedTableToolbar />
            {!context.orders.isLoaded ? (
              <Box
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <CircularProgress size={26} />
              </Box>
            ) : (
              <div className={classes.tableWrapper}>
                <Table
                  className={classes.table}
                  aria-labelledby="tableTitle"
                  aria-label="enhanced table"
                >
                  <EnhancedTableHead
                    classes={classes}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={total}
                  />
                  <OrdersProvider>
                    <TableBody>
                      {backOrders
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage,
                        )
                        .map((row, index) => {
                          return (
                            <TableRow hover role="checkbox" key={row.id}>
                              <TableCell>{row.userId}</TableCell>
                              <TableCell>{row.item}</TableCell>
                              <TableCell>{row.type}</TableCell>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.phonenumber}</TableCell>
                              <TableCell>{row.data}</TableCell>

                              <TableCell>
                                <Box display={"flex"} alignItems={"center"}>
                                  <Typography display={"inline"}>
                                    {row.status ? "Processed" : "Unprocessed"}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box display={"flex"} alignItems={"center"}>
                                  {!row.status && (
                                    <Button
                                      color="success"
                                      size="small"
                                      style={{ marginRight: 8 }}
                                      variant="contained"
                                      onClick={e =>
                                        verifyOrder(row._id, history, e)
                                      }
                                    >
                                      Process
                                    </Button>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}

                      {emptyRows > 0 && (
                        <TableRow style={{ height: 53 * emptyRows }}>
                          <TableCell colSpan={6} />
                        </TableRow>
                      )}
                    </TableBody>
                  </OrdersProvider>
                </Table>
              </div>
            )}
            <TablePagination
              rowsPerPageOptions={[10]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              backIconButtonProps={{
                "aria-label": "previous page",
              }}
              nextIconButtonProps={{
                "aria-label": "next page",
              }}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </Widget>
        </Grid>
      </Grid>
    </>
  );
}

function CloseButton({ closeToast, className }) {
  return <CloseIcon className={className} onClick={closeToast} />;
}

export default withRouter(OrdersPage);
