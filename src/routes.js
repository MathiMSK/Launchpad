/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
import Register from "views/examples/Register.js";
import Login from "views/Login/Login.js";
import Admin from "views/examples/Admin";
import Subscription from "views/examples/Subscription";
import Events from "views/examples/Events";
import Jobs from "views/examples/Jobs";
import CarrerAssesment from "views/examples/CarrerAssesment";
import AiFeatures from "views/examples/AiFeatures";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  // {
  //   path: "/maps",
  //   name: "Maps",
  //   icon: "ni ni-pin-3 text-orange",
  //   component: <Maps />,
  //   layout: "/admin",
  // },
  {
    path: "/adminlists",
    name: "Admin",
    icon: "ni ni-single-02 ",
    component: <Admin />,
    layout: "/admin",
  },
  {
    path: "/subscription",
    name: "Subscription",
    icon: "ni ni-planet ",
    component: <Subscription />,
    layout: "/admin",
  },
  {
    path: "/events",
    name: "Events",
    icon: "fa fa-calendar ",
    component: <Events />,
    layout: "/admin",
  },
  {
    path: "/jobs",
    name: "Jobs",
    icon: "ni ni-briefcase-24 ",
    component: <Jobs />,
    layout: "/admin",
  },
  {
    path: "/carrerassesments",
    name: "Carrer Assesments",
    icon: "ni ni-badge",
    component: <CarrerAssesment />,
    layout: "/admin",
  },
  {
    path: "/aifeatures",
    name: "Ai Features",
    icon: "ni ni-atom ",
    component: <AiFeatures />,
    layout: "/admin",
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
  },
  // {
  //   path: "/register",
  //   name: "Register",
  //   icon: "ni ni-circle-08 text-pink",
  //   component: <Register />,
  //   layout: "/auth",
  // },
];
export default routes;
