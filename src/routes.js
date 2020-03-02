import React from 'react'
import { Route } from 'react-router-dom'
import { ConnectedSwitch } from 'reactRouterConnected'
import Loadable from 'react-loadable'
import Page from 'components/LayoutComponents/Page'
import NotFoundPage from 'pages/DefaultPages/NotFoundPage'
import HomePage from 'pages/DefaultPages/HomePage'

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null,
  })

const loadableRoutes = {
  // Default Pages
  '/login': {
    component: loadable(() => import('pages/DefaultPages/LoginPage')),
  },
  '/login/restore/:email': {
    component: loadable(() => import('pages/DefaultPages/LoginPage')),
  },
  '/registration': {
    component: loadable(() => import('pages/DefaultPages/RegistrationPage')),
  },
  '/profile': {
    component: loadable(() => import('pages/DefaultPages/UserProfilePage')),
  },

  // Pages
  '/leaderboard': {
    component: loadable(() => import('pages/Pages/LeaderboardPage')),
  },
  '/insights': {
    component: loadable(() => import('pages/Pages/InsightsPage')),
  },
  '/data/:id?': {
    component: loadable(() => import('pages/Pages/DataPage')),
    exact: false,
  },
  '/media/:search?': {
    component: loadable(() => import('pages/Pages/MediaPage')),
    exact: false,
  },
  '/reports': {
    component: loadable(() => import('pages/Pages/ReportsPage')),
  },
  '/reports/compare/:id?': {
    component: loadable(() => import('pages/Pages/CompareProfilesPage')),
    exact: false,
  },
  '/admin/profiles': {
    component: loadable(() => import('pages/Pages/AdminPage')),
  },
  '/admin/profiles/add': {
    component: loadable(() => import('pages/Pages/AddProfilePage')),
    exact: false,
  },
  '/admin/profiles/edit/:id?': {
    component: loadable(() => import('pages/Pages/EditProfilePage')),
    exact: false,
  },
  '/users': {
    component: loadable(() => import('pages/Pages/UserManagementPage')),
  },
  '/users/add': {
    component: loadable(() => import('pages/Pages/UserDataPage')),
  },
  '/users/edit/:id?': {
    component: loadable(() => import('pages/Pages/UserDataPage')),
    exact: false,
  },
  '/brands': {
    component: loadable(() => import('pages/Pages/BrandsManagementPage')),
  },
  '/analytics': {
    component: loadable(() => import('pages/Pages/AnalyticsPage')),
  },
}

class Routes extends React.Component {
  timeoutId = null

  componentDidMount() {
    this.timeoutId = setTimeout(
      () => Object.keys(loadableRoutes).forEach(path => loadableRoutes[path].component.preload()),
      5000, // load after 5 sec
    )
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }

  render() {
    return (
      <ConnectedSwitch>
        <Route exact path="/" component={HomePage} />
        {Object.keys(loadableRoutes).map(path => {
          const { exact, title, ...props } = loadableRoutes[path]
          props.exact = exact === void 0 || exact || false // set true as default
          return <Route key={path} title={title} path={path} {...props} />
        })}
        <Route
          render={() => (
            <Page>
              <NotFoundPage />
            </Page>
          )}
        />
      </ConnectedSwitch>
    )
  }
}

export { loadableRoutes }
export default Routes
