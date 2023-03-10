import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Animated,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { deleteReview } from '../../../api/review';
import RootNavigation from '../../../RootNavigation';
import GroupUserCard from '../userCard';
import AppLoading from '../../common/appLoading';
import { colors, screenWidth, toSize } from '../../../config/globalStyle';
import jwt_decode from 'jwt-decode';
import { callApi } from '../../../function/auth';
import { postGroupsMembersExile, postMembersFollow } from '../../../api/group';
import Toast from 'react-native-simple-toast';
import { getGroupsReview } from '../../../api/group';
import GroupReviewCard from '../reviewCard';
import AppText from '../../common/appText';
import Config from 'react-native-config';
import { useFocusEffect } from '@react-navigation/native';
import updateSameText from '../../../function/updateSameText';
import AppModal from '../../common/appModal';
import { setIds } from '../../../store/feature/userSlice';

const GroupInfoList = ({
  data,
  homeData,
  tabData,
  refreshMember,
  visible,
  type,
  handleGetData,
  scrollY,
  sub,
  setToastText,
  groupId,
  reviewCount,
  isRefresh,
}) => {
  const [refresh, setRefresh] = useState(false);
  const [exileMid, setExileMid] = useState();
  const collapsibleHeaderHeight = toSize(181);
  const [reviewData, setReviewData] = useState();
  const [lastReviewId, setlastReviewId] = useState(null);
  const [reviewId, setReviewId] = useState(false);
  const [quitVisible, setQuitVisible] = useState(false);
  const [reviewDeleteVisible, setReviewDeleteVisible] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const MID = useSelector((state) => state.user.authInfo?.MID);
  const tabHeight = toSize(57);
  const ids = useSelector((state) => state.user.ids);
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      if (type === '??? ??????' && !reviewData) {
        const params = [
          groupId,
          {
            pageSize: 10,
            targetMid: MID,
          },
        ];
        callApi(getGroupsReview, params, handleReview);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewData]),
  );

  useFocusEffect(
    useCallback(() => {
      if (isRefresh) {
        onRefresh();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRefresh]),
  );

  useEffect(() => {
    if (type === '??????' && data?.members && tabData[0].active) {
      handleGetData();
    } else if (type === '??? ??????' && reviewData && tabData[1].active) {
      onRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabData[0].active, tabData[1].active]);

  const tabEtcMemberPress = (item) =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [
          '??????',
          item.follow ? '???????????????' : '???????????????',
          '?????? ????????????',
        ],
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          console.log('cancel');
        } else if (buttonIndex === 1) {
          if (!isApiLoading) {
            setIsApiLoading(true);
            if (item.follow) {
              callApi(
                postMembersFollow,
                { groupId, targetMid: item.mid },
                handleUnfollow,
              );
            } else {
              callApi(
                postMembersFollow,
                { groupId, targetMid: item.mid },
                handleFollow,
              );
            }
          }
        } else if (buttonIndex === 2) {
          setQuitVisible(true);
          setExileMid(item.mid);
        }
      },
    );

  const handleFollow = (res) => {
    setIsApiLoading(false);
    if (res.data.apiStatus.apiCode === 200) {
      setToastText((text) => updateSameText('????????? ????????? ????????????', text));
      handleGetData();
    }
  };

  const handleUnfollow = (res) => {
    setIsApiLoading(false);
    if (res.data.apiStatus.apiCode === 200) {
      setToastText((text) => updateSameText('????????? ???????????? ????????????', text));
      handleGetData();
    }
  };

  const optionsOwner = ['??????', '????????????', '????????????'];
  const optionsOwnerDelete = ['??????', '????????????'];
  const tabEtcPressOwner = (targetReview) =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: homeData?.isDelete ? optionsOwnerDelete : optionsOwner,
        cancelButtonIndex: 0,
        destructiveButtonIndex: homeData?.isDelete ? 1 : 2,
        userInterfaceStyle: 'light',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          console.log('cancel');
        } else if (buttonIndex === 1) {
          if (homeData?.isDelete) {
            setReviewId(targetReview.review.reviewId);
            setReviewDeleteVisible(true);
          } else {
            console.log('TTTT:: ', targetReview);
            dispatch(
              setIds({ reviewId: targetReview.review.reviewId, ...ids }),
            );
            RootNavigation.navigate('ReviewDetailScreen', {
              ids: {
                groupId,
                reviewId: targetReview.review.reviewId,
                fromInfo: true,
              },
            });
            RootNavigation.navigate('ReviewPostScreen', {
              nowPage: 'review_edit',
              reviewData: {
                placeId: targetReview.place.placeId,
                placeName: targetReview.place.placeName,
                placeAddress: targetReview.place.roadAddress,
                reviewImagesUrl: targetReview?.review?.images,
                reviewContent: targetReview.review.content,
              },
              fromDetailScreen: 'Info',
            });
          }
        } else if (buttonIndex === 2) {
          setReviewId(targetReview.review.reviewId);
          setReviewDeleteVisible(true);
        }
      },
    );

  const onRefresh = () => {
    if (type === '??????') {
      refreshMember();
    } else {
      const params = [groupId, { pageSize: 10, targetMid: MID }];
      callApi(getGroupsReview, params, handleReview);
    }
  };

  const handleDeleteReivew = (res) => {
    if (res.data.apiStatus.apiCode === 200) {
      onRefresh();
    }
  };

  const handleReview = (res) => {
    if (res.data.apiStatus.apiCode === 200) {
      setReviewData(res.data.data.reviewData);
      setlastReviewId(res.data.data.lastReviewSeq);
    }
  };

  const handleReviewEnd = (res) => {
    if (res.data.apiStatus.apiCode === 200) {
      const tempData = [...reviewData, ...res.data.data.reviewData];
      setReviewData(tempData);
      setlastReviewId(res.data.data.lastReviewSeq);
    }
  };

  const Card = type === '??????' ? GroupUserCard : GroupReviewCard;

  return visible ? (
    <>
      {isEmpty(data) && data?.length !== 0 ? (
        <AppLoading
          overlay={false}
          transparent={true}
          indicatorColor={colors.black}
        />
      ) : (
        <Animated.FlatList
          contentContainerStyle={{
            paddingTop: collapsibleHeaderHeight + tabHeight,
            paddingBottom: type === '??????' ? toSize(20) : toSize(150),
          }}
          refreshControl={
            <RefreshControl
              refreshing={refresh}
              onRefresh={onRefresh}
              progressViewOffset={collapsibleHeaderHeight + tabHeight}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppText
                size={16}
                color={colors.Color6B6A6A}
                style={styles.emptyText}
              >
                ?????? ????????? ????????? ?????????
              </AppText>
            </View>
          }
          showsVerticalScrollIndicator={false}
          // contentOffset={{ x: 0, y: scrollY._value }}
          data={type === '??????' ? data.members : reviewData}
          keyExtractor={(item, index) => `GroupInfoList_${index}`}
          renderItem={({ item, index }) => (
            <Card
              fromInfo
              data={item}
              isDelete={homeData?.isDelete}
              setToastText={setToastText}
              userId={MID}
              groupId={groupId}
              master={data.master}
              sub={sub}
              onPressEtc={() => tabEtcPressOwner(item)}
              onPress={() =>
                type === '??????' &&
                RootNavigation.navigate('GroupUserScreen', {
                  groupId,
                  mid: item.mid,
                  fromInfo: true,
                })
              }
              iconPress={
                sub === data.master
                  ? () => tabEtcMemberPress(item)
                  : () => {
                      if (!isApiLoading) {
                        setIsApiLoading(true);
                        if (item.follow) {
                          callApi(
                            postMembersFollow,
                            { groupId, targetMid: item.mid },
                            handleUnfollow,
                          );
                        } else {
                          callApi(
                            postMembersFollow,
                            { groupId, targetMid: item.mid },
                            handleFollow,
                          );
                        }
                      }
                    }
              }
            />
          )}
          scrollEventThrottle={4}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: true,
            },
          )}
          onEndReachedThreshold={0}
          onEndReached={({ distanceFromEnd }) => {
            if (distanceFromEnd) {
              // ????????? ????????????
              if (type === '??? ??????' && reviewData.length < reviewCount) {
                const params = [
                  groupId,
                  {
                    pageSize: 10,
                    targetMid: MID,
                    lastReviewSeq: lastReviewId,
                  },
                ];
                callApi(getGroupsReview, params, handleReviewEnd);
              }
            }
          }}
        />
      )}
      <AppModal
        visible={reviewDeleteVisible}
        subSize={16}
        title={'???????????? ??????????????????????'}
        leftButtonText={'??????'}
        onPressLeft={() => setReviewDeleteVisible(false)}
        rightButtonText={'????????????'}
        onPressRight={() => {
          setReviewDeleteVisible(false);
          callApi(
            deleteReview,
            { groupId: groupId, reviewId: reviewId },
            handleDeleteReivew,
          );
        }}
      />

      <AppModal
        visible={quitVisible}
        title={'?????? ????????? ??????????????????????'}
        leftButtonText={'??????'}
        onPressLeft={() => {
          setExileMid(null);
          setQuitVisible(false);
        }}
        rightButtonText={'????????????'}
        onPressRight={() => {
          setQuitVisible(false);
          callApi(
            postGroupsMembersExile,
            { groupId, targetMid: exileMid },
            handleDeleteReivew,
          );
          setExileMid(null);
        }}
      />
    </>
  ) : (
    <></>
  );
};

export const styles = StyleSheet.create({
  empty: {
    marginTop: toSize(185),
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default GroupInfoList;
