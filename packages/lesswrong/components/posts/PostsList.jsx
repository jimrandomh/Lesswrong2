import { Components, registerComponent, withMulti, Utils } from 'meteor/vulcan:core';
import React from 'react';
import PropTypes from 'prop-types';
import { Posts } from '../../lib/collections/posts';
import { FormattedMessage, intlShape } from 'meteor/vulcan:i18n';
import classNames from 'classnames';
import withUser from '../common/withUser';
import { withStyles } from '@material-ui/core/styles'

const Error = ({error}) => <div>
  <FormattedMessage id={error.id} values={{value: error.value}}/>{error.message}
</div>;

const styles = theme => ({
  loading: {
    opacity: .4,
  }
})

const PostsList = ({
  className,
  results,
  loading,
  count,
  totalCount,
  loadMore,
  showLoadMore = true,
  showNoResults = true,
  networkStatus,
  currentUser,
  dimWhenLoading,
  error,
  classes,
  terms}) => {

  // TODO-Q: Is there a composable way to check whether this is the second
  //         time that networkStatus === 1, in order to prevent the loading
  //         indicator showing up on initial pageload?
  //
  //         Alternatively, is there a better way of checking that this is
  //         in fact the best way of checking loading status?

  // TODO-A (2019-2-20): For now, solving this with a flag that determines whether
  //                     to dim the list during loading, so that the pages where that
  //                     behavior was more important can work fine. Will probably
  //                     fix this for real when Apollo 2 comes out
  const loadingMore = networkStatus === 2 || networkStatus === 1;
  const renderContent = () => {

    const { Loading, PostsItem, PostsLoadMore, PostsNoResults } = Components
    if (results && results.length) {
      return <div>
        { loading && dimWhenLoading && <Loading />}
        <div className="posts-list-wrapper">
          {results.map(post => <PostsItem key={post._id} post={post} currentUser={currentUser} terms={terms} /> )}
        </div>
        { loading && !dimWhenLoading && <Loading />}
        {showLoadMore ? <PostsLoadMore loading={loadingMore} loadMore={loadMore} count={count} totalCount={totalCount} /> : null}
      </div>
    } else if (loading) {
      return <Loading/>
    } else if (showNoResults) {
      return <PostsNoResults/>
    }
  }
  return (
    <div className={classNames(className, 'posts-list', {[classes.loading]: loading && dimWhenLoading})}>
      {error ? <Error error={Utils.decodeIntlError(error)} /> : null }
      <div className="posts-list-content">
        { renderContent() }
      </div>
    </div>
  )
};

PostsList.displayName = "PostsList";

PostsList.propTypes = {
  results: PropTypes.array,
  terms: PropTypes.object,
  hasMore: PropTypes.bool,
  loading: PropTypes.bool,
  count: PropTypes.number,
  totalCount: PropTypes.number,
  loadMore: PropTypes.func,
  dimWhenLoading: PropTypes.bool
};

PostsList.contextTypes = {
  intl: intlShape
};

const options = {
  collection: Posts,
  queryName: 'postsListQuery',
  fragmentName: 'PostsList',
  enableTotal: false,
  enableCache: true,
  fetchPolicy: 'cache-and-network',
  ssr: true
};

registerComponent('PostsList', PostsList, withUser, [withMulti, options], withStyles(styles, {name:"PostsList"}));
