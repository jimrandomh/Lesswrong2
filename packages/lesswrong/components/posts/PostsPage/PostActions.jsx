import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { registerComponent, Components, withUpdate } from 'meteor/vulcan:core';
import Users from 'meteor/vulcan:users'
import withUser from '../../common/withUser'
import { Posts } from '../../../lib/collections/posts';
import withSetAlignmentPost from "../../alignment-forum/withSetAlignmentPost";
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from 'react-router-dom'

const styles = theme => ({
  root: {
    margin: 0,
    ...theme.typography.display3,
    ...theme.typography.postStyle,
    ...theme.typography.headerStyle,
    color: theme.palette.text.primary,
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.5rem',
      marginBottom: 10,
      maxWidth: '80%'
    }
  },
})

class PostActions extends Component {

  handleMoveToMeta = () => {
    const { post, updatePost } = this.props
    updatePost({
      selector: { _id: post._id},
      data: {
        meta: true,
        draft: false,
        metaDate: new Date(),
        frontpageDate: null,
        curatedDate: null
      },
    })
  }

  handleMoveToFrontpage = () => {
    const { post, updatePost } = this.props
    updatePost({
      selector: { _id: post._id},
      data: {
        frontpageDate: new Date(),
        meta: false,
        draft: false
      },
    })
  }

  handleMoveToPersonalBlog = () => {
    const { post, updatePost } = this.props
    updatePost({
      selector: { _id: post._id},
      data: {
        draft: false,
        meta: false,
        curatedDate: null,
        frontpageDate: null
      },
    })
  }

  handleMoveToAlignmentForum = () => {
    const { post, setAlignmentPostMutation } = this.props
    setAlignmentPostMutation({
      postId: post._id,
      af: true,
    })
  }

  handleRemoveFromAlignmentForum = () => {
    const { post, setAlignmentPostMutation } = this.props
    setAlignmentPostMutation({
      postId: post._id,
      af: false,
    })
  }

  render() {
    const { classes, post, Container, currentUser } = this.props
    return (
      <div className={classes.actions}>
      { Posts.canEdit(currentUser,post) && <Link to={{pathname:'/editPost', query:{postId: post._id, eventForm: post.isEvent}}}>
        <MenuItem>Edit</MenuItem>
      </Link>}
        { Users.canDo(currentUser, "posts.edit.all") &&
          <span>
            { !post.meta &&
              <div onClick={this.handleMoveToMeta}>
                <Container>
                  Move to Meta
                </Container>
              </div>
            }
            { !post.frontpageDate &&
              <div onClick={this.handleMoveToFrontpage}>
                <Container>
                  Move to Frontpage
                </Container>
              </div>
            }
            { (post.frontpageDate || post.meta || post.curatedDate) &&
               <div onClick={this.handleMoveToPersonalBlog}>
                 <Container>
                   Move to Personal Blog
                 </Container>
               </div>
            }
          </span>
        }
        <Components.SuggestAlignment post={post} Container={Container}/>
        { Users.canMakeAlignmentPost(currentUser, post) &&
          !post.af && <div onClick={this.handleMoveToAlignmentForum }>
            <Container>
              Ω Move to Alignment
            </Container>
          </div>}
        { Users.canMakeAlignmentPost(currentUser, post) && post.af &&
          <div onClick={this.handleRemoveFromAlignmentForum}>
            <Container>
              Ω Remove Alignment
            </Container>
          </div>
        }
        <Components.SuggestCurated post={post} Container={Container}/>
        <Components.MoveToDraft post={post} Container={Container}/>
        <Components.DeleteDraft post={post} Container={Container}/>
      </div>
    )
  }
}
const withUpdateOptions = {
  collection: Posts,
  fragmentName: 'PostsList',
};

const setAlignmentOptions = {
  fragmentName: "PostsList"
}



registerComponent('PostActions', PostActions,
  withStyles(styles, {name: "PostActions"}),
  withUser,
  [withUpdate, withUpdateOptions],
  [withSetAlignmentPost, setAlignmentOptions])
