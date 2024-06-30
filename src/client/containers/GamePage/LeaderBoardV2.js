import React from 'react';
import { Paper, Grid, Box, Container, List, ListItem, ListItemAvatar, ListItemText, Avatar, LinearProgress, Typography, AppBar, Tabs, Tab, Toolbar, IconButton, Menu, MenuItem, Divider, Switch, TextField, ListItemSecondaryAction, Popover, Button, Fade, Modal, Backdrop } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import SettingsIcon from '@material-ui/icons/Settings';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import { Icon, InlineIcon } from '@iconify/react';
import crownIcon from '@iconify/icons-fa-solid/crown';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  list: {
    overflow: "auto",
    maxHeight: 180,
    height: "15em"
  },
  title: {
    flexGrow: 1
  },
  header: {
    borderTopLeftRadius: "inherit",
    borderTopRightRadius: "inherit",
    boxShadow: "none",
    minHeight: "44px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  bottom: {
    backgroundColor: "#3f51b5",
    color: "white",
    borderBottomLeftRadius: "inherit",
    borderBottomRightRadius: "inherit",
    paddingTop: ".5rem",
    paddingBottom: ".5rem"
  },
  position: {
    fontWeight: "bold"
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  colorWhite: {
    color: "white"
  },
  button: {
    width: "100%",
    justifyContent: "space-between"
  },
  leaderboardPaper: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  top: {
    borderTopLeftRadius: "inherit",
    borderTopRightRadius: "inherit"
  }
}));

function Crown(props) {
  if (props == null || props.score == 0) return "";
  let colors = ['#FFF501', '#E8E8E8', '#DB8D0E'];
  switch (props.index + 1) {
    case 1:
    case 2:
    case 3:
      return <Icon icon={crownIcon} color={colors[props.index]} height="20" />;
      break;
    default:
      return "";
      break;
  }
}

function PlayerList(props) {
  return (
    <React.Fragment>
      <ListItem button>
        <ListItemAvatar>
          <Avatar>
            <AccountCircleIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={props.username} secondary={props.score + " points"} />
        <Crown index={props.index} score={props.score} />
        <ListItemSecondaryAction>
          #{props.index + 1}
        </ListItemSecondaryAction>
      </ListItem>
      <Divider variant="inset" component="li" />
    </React.Fragment>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {children}
    </Typography>
  );
}

function LeaderBoard({ listPlayer, order, handleSocketClose }) {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const sortPlayers = (a, b) => {
    //console.log("COMPARE : " + a.pointsTotal + " " + b.pointsTotal);
    return b.pointsTotal - a.pointsTotal;
  }

  
  /**
   * Settings popover utils
   */
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSettingsClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  /** */

  /**
   * Stats modal utils
   */
  const [openStats, setOpenStats] = React.useState(false);

  const handleStatsClick = () => {
    setOpenStats(true);
  }

  const handleStatsClose = () => {
    setOpenStats(false);
  }
  /** */

  //construction des styles
  const classes = useStyles();

  
  return (
    <Box >
      <Paper >
        <Box className={classes.top}>
          <AppBar position="static" className={classes.header}>
            <Box display="flex" alignItems="center" ml={2}>
              <Typography variant="h6" className={classes.title}>
                LEADERBOARD
              </Typography>

              <div>
                <IconButton
                  color="inherit"
                  aria-label="menu"
                  aria-describedby={id}
                  onClick={handleSettingsClick}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>

                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleSettingsClose}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right"
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right"
                  }}
                >
                  <Button
                    color="primary"
                    className={classes.button}
                    onClick={handleStatsClick}
                    startIcon={<EqualizerIcon />}
                  >
                    Statistics
                  </Button>
                  <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    className={classes.modal}
                    open={openStats}
                    onClose={handleStatsClose}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                      timeout: 500
                    }}
                  >
                    <Fade in={openStats}>
                      <Box justify="center">
                        <Typography variant="h6" className={classes.colorWhite}>
                          Game statistics
                        </Typography>
                        <Paper>
                          <Box px={1}>
                            <Divider />
                            <Typography>{listPlayer.length} players</Typography>
                            <Typography>WIP</Typography>
                          </Box>
                        </Paper>
                      </Box>
                    </Fade>
                  </Modal>

                  <div>
                    <Link
                      to="/"
                      onClick={e => {
                        handleSocketClose();
                      }}
                    >
                      <Button
                        color="secondary"
                        className={classes.button}
                        startIcon={<ExitToAppIcon />}
                      >
                        Leave game
                      </Button>
                    </Link>
                  </div>
                </Popover>
              </div>
            </Box>
          </AppBar>
          <List disablePadding className={classes.list}>
            {listPlayer.sort(sortPlayers).map((player, index) => (
              <PlayerList
                key={index}
                index={index}
                order={player.order}
                username={player.username}
                id={player.socketID}
                score={player.pointsTotal}
              />
            ))}
          </List>
        </Box>
        <Grid
          container
          alignItems="center"
          justify="center"
          align="center"
          className={classes.bottom}
        >
          {order === 0 ? (
            <span> You are drawing !</span>
          ) : (
            <span>
              You will draw in <span className={classes.position}>{order}</span>{" "}
              rounds.
            </span>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}

export default LeaderBoard;