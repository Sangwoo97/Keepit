import React, { useCallback, useEffect, useRef, useState } from 'react';
import RootNavigation from '../../../RootNavigation';
import Screen from '../../Screen';
import MyIcon from '../../../config/icon-font';
import { get } from 'lodash';
import { callApi } from '../../../function/auth';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  deleteGroups,
  deleteGroupsLeave,
  getGroupsAlarmList,
  getGroupsDetail,
  getGroupsHome,
  patchGroupsAlarmList,
  postGroupsFavorite,
  postGroupsMembersExile,
} from '../../../api/group';
import { colors, globalStyle, toSize } from '../../../config/globalStyle';
import AnimatedHeader from '../../../component/common/animatedHeader';
import { initialScroll } from '../../../function/header';
import { ActionSheetIOS, Animated, Keyboard, View } from 'react-native';
import jwt_decode from 'jwt-decode';
import { styles } from './styles';
import GroupTab from '../../../component/group/tab';
import AppTouchable from '../../../component/common/appTouchable';
import GroupHeader from '../../../component/group/header';
import GroupInfoList from '../../../component/group/infoList';
import { useDispatch, useSelector } from 'react-redux';
import BottomSheetBackdrop from '../../../component/login/customBackdrop';
import InvitationView from '../../../component/group/invitationView';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppModal from '../../../component/common/appModal';
import Svg from '../../../asset/svg';
import updateSameText from '../../../function/updateSameText';
import { setGroupToast } from '../../../store/feature/groupSlice';
import { getMembersAlarms } from '../../../api/user';
import requestUserPermission from '../../../function/fcm';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GroupInfoScreen = ({ route: { params } }) => {
  const insets = useSafeAreaInsets();
  const groupId = params.groupId;
  const [data, setData] = useState();
  const [homeData, setHomeData] = useState();
  const [type, setType] = useState('??????');
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [myQuitVisible, setMyQuitVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [serviceVisible, setServiceVisible] = useState(false);
  const [toastText, setToastText] = useState();
  const [isRefresh, setIsRefresh] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const dispatch = useDispatch();
  const MID = useSelector((state) => state.user.authInfo.MID);
  const [alarmYn, setAlarmYn] = useState();
  const [isAlarmPermission, setIsAlarmPermission] = useState(true);
  useEffect(() => {
    if (params?.groupId) {
      const getData = async () => {
        const [{ data: permissionData }, { data: toggleListData }] =
          await Promise.all([getMembersAlarms(), getGroupsAlarmList('REVIEW')]);
        if (toggleListData.apiStatus.apiCode === 200) {
          toggleListData.data.forEach((d) => {
            if (d?.groupId === params?.groupId) {
              setAlarmYn(d?.alarmYn);
            }
          });
        }
        if (
          permissionData?.data?.allSetting &&
          permissionData?.data?.newReview
        ) {
          setIsAlarmPermission(true);
        } else {
          setIsAlarmPermission(false);
        }
      };
      getData();
    }
  }, [params?.groupId]);
  const ref = useRef(null);
  const snapPoints = [toSize(1), toSize(539)];

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.6}
        onPress={() => Keyboard.dismiss()}
      />
    ),
    [],
  );

  const navigation = useNavigation();

  // ??????????????? ?????? ??????
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (
          e.data.action.type === 'NAVIGATE' ||
          params.fromScreen === 'AlarmMainScreen' ||
          !params.fromScreen
        ) {
          return;
        }
        e.preventDefault();
        RootNavigation.navigate('GroupHomeScreen', {
          groupId: groupId,
          isRefresh: true,
        });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation, params],
  );

  useFocusEffect(
    useCallback(() => {
      if (params.isRefresh) {
        setIsRefresh(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]),
  );

  const handleSheetChanges = (index) => {
    if (index < 1) {
      Keyboard.dismiss();
      setKeyboardFocus(false);
    }
  };

  const handleSheet = useCallback((index) => {
    ref.current.snapToIndex(index);
  }, []);

  const handleFavorite = (res) => {
    setIsApiLoading(false);
    if (res.data.apiStatus.apiCode === 200) {
      setToastText((text) =>
        updateSameText('???????????? ????????? ??????????????????.', text),
      );
      callApi(getGroupsDetail, groupId, handleGroup);
    }
  };

  const handleUnfavorite = (res) => {
    setIsApiLoading(false);
    if (res.data.apiStatus.apiCode === 200) {
      setToastText((text) =>
        updateSameText('???????????? ???????????? ??????????????????.', text),
      );
      callApi(getGroupsDetail, groupId, handleGroup);
    }
  };

  const tabData = [
    { title: '??????', onPress: () => setType('??????'), active: type === '??????' },
    {
      title: '??? ??????',
      onPress: () => setType('??? ??????'),
      active: type === '??? ??????',
    },
  ];

  const options = ['??????', '?????? ????????????', '?????? ?????????'];
  const optionsDelete = ['??????', '?????? ?????????'];
  const tabEtcPress = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: homeData.isDelete ? optionsDelete : options,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light',
        destructiveButtonIndex: homeData.isDelete ? 1 : 2,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          console.log('cancel');
        } else if (buttonIndex === 1) {
          if (homeData.isDelete) {
            setMyQuitVisible(true);
          } else {
            setServiceVisible(true);
          }
          // handleSheet(1);
          // setKeyboardFocus(true);
        } else if (buttonIndex === 2) {
          setMyQuitVisible(true);
        }
      },
    );

  const optionsMaster = [
    '??????',
    '?????? ?????? ????????????',
    '?????? ????????????',
    '?????? ????????????',
  ];
  const tabEtcPressMaster = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: optionsMaster,
        destructiveButtonIndex: 3,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'light',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          console.log('cancel');
        } else if (buttonIndex === 1) {
          RootNavigation.navigate('GroupCreateScreen', {
            modify: true,
            groupId: groupId,
            inMembers: homeData.memberCount,
          });
        } else if (buttonIndex === 2) {
          setServiceVisible(true);
          // handleSheet(1);
          // setKeyboardFocus(true);
        } else if (buttonIndex === 3) {
          setDeleteVisible(true);
        }
      },
    );

  const memberScrollY = useRef(new Animated.Value(0)).current;
  const reviewScrollY = useRef(new Animated.Value(0)).current;
  const scrollY = type === '??????' ? memberScrollY : reviewScrollY;
  const collapsibleHeaderHeight = toSize(181);
  const tabHeight = toSize(57);
  let clampScrollValue = 0;
  let scrollValue = 0;

  useEffect(() => {
    if (type === '??????') {
      reviewScrollY.setValue(0);
    } else if (type === '??? ??????') {
      memberScrollY.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useFocusEffect(
    useCallback(() => {
      callApi(getGroupsDetail, groupId, handleGroup);
      callApi(getGroupsHome, groupId, handleGroupHome);
      initialScroll(
        scrollY,
        collapsibleHeaderHeight,
        scrollValue,
        clampScrollValue,
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const refreshMember = () => {
    callApi(getGroupsDetail, groupId, handleGroup);
    callApi(getGroupsHome, groupId, handleGroupHome);
  };

  const handleGroup = (res) => {
    if (res.data.apiStatus.apiCode === 200) {
      console.log(res.data.data.favorite);
      setData(res.data.data);
    }
  };

  const handleGroupHome = (res) => {
    if (res.data.apiStatus.apiCode === 200) {
      setHomeData(res.data.data);
    }
  };

  const handleGetData = () => {
    callApi(getGroupsDetail, groupId, handleGroup);
  };

  const handleLeave = (res) => {
    if (res.data.apiStatus.apiCode === 200) {
      // RootNavigation.goBack();
      // dispatch(setGroupToast(true));
      RootNavigation.navigate('Main');
    }
  };

  const handleLeaveMaster = (res) => {
    if (res.data.apiStatus.apiCode === 200) {
      // RootNavigation.goBack();
      // dispatch(setGroupToast(true));
      RootNavigation.navigate('Main');
    }
  };

  return (
    <Screen
      toastMargin
      toastText={toastText}
      type={'view'}
      style={{ paddingTop: 0 }}
      topSafeArea={false}
    >
      <View style={{ flex: 1 }}>
        <View
          style={[
            styles.headerContainer,
            { height: insets.top + toSize(42), paddingTop: insets.top },
          ]}
        >
          <AppTouchable
            style={[styles.leftButton, { marginLeft: toSize(8) }]}
            onPress={() => {
              if (
                params.fromScreen === 'AlarmMainScreen' ||
                !params.fromScreen
              ) {
                RootNavigation.goBack();
              } else {
                RootNavigation.navigate('GroupHomeScreen', {
                  groupId: data?.groupId,
                  isRefresh: true,
                });
              }
            }}
          >
            {Svg('back_thin')}
          </AppTouchable>
          <View style={globalStyle.flexRow}>
            <AppTouchable
              style={[styles.button, { marginRight: toSize(6) }]}
              onPress={() => {
                if (!isApiLoading) {
                  setIsApiLoading(true);
                  if (data?.favorite) {
                    callApi(
                      postGroupsFavorite,
                      data?.groupId,
                      handleUnfavorite,
                    );
                  } else {
                    callApi(postGroupsFavorite, data?.groupId, handleFavorite);
                  }
                }
              }}
            >
              {data?.favorite ? (
                <MyIcon
                  name={'ic_star'}
                  size={toSize(20)}
                  color={colors.ColorFEE500}
                />
              ) : (
                Svg('ic_star_empty_black')
              )}
            </AppTouchable>
            <AppTouchable
              onPress={() => {
                console.log('PRESS');
                if (homeData?.isDelete) {
                  return;
                }
                if (alarmYn && isAlarmPermission) {
                  setToastText((text) =>
                    updateSameText('?????? ????????? ??????????????????.', text),
                  );
                  setAlarmYn((d) => !d);
                  patchGroupsAlarmList({ groupId, alarmType: 'REVIEW' });
                } else if (!alarmYn && isAlarmPermission) {
                  setToastText((text) =>
                    updateSameText(
                      `?????? ????????? ??????????????????. ?????? ?????????
????????? ??? ???????????? ????????? ??? ?????????.`,
                      text,
                      true,
                    ),
                  );
                  setAlarmYn((d) => !d);
                  patchGroupsAlarmList({ groupId, alarmType: 'REVIEW' });
                } else if (!isAlarmPermission) {
                  setToastText((text) =>
                    updateSameText(
                      `?????? ????????? ??? ???????????????. ?????? ????????????
?????? ??????, ????????? ????????? ????????????.`,
                      text,
                      true,
                    ),
                  );
                }
                requestUserPermission();
              }}
              style={[styles.button, { marginRight: toSize(6) }]}
              disabled={homeData?.isDelete}
            >
              {homeData?.isDelete
                ? Svg('ic_alarm_header_delete')
                : alarmYn && isAlarmPermission
                ? Svg('ic_alarm_header_ring')
                : Svg('ic_alarm_header')}
            </AppTouchable>
            <AppTouchable
              style={[styles.button, { marginRight: toSize(6) }]}
              disabled={data?.master === MID && homeData?.isDelete}
              onPress={data?.master === MID ? tabEtcPressMaster : tabEtcPress}
            >
              {/* <MyIcon
                name={'ic_etc_vertical'}
                color={
                  data?.master === MID && homeData?.isDelete
                    ? colors.ColorE5E5E5
                    : 'black'
                }
                size={toSize(18)}
              /> */}
              {Svg('ic_etc_sec')}
            </AppTouchable>
          </View>
        </View>
        <AnimatedHeader
          style={{ marginTop: toSize(42) + insets.top }}
          headerHeight={collapsibleHeaderHeight}
          translateHeight={collapsibleHeaderHeight}
          scrollY={scrollY}
          // opacity={false}
        >
          {data && <GroupHeader data={data} />}
        </AnimatedHeader>

        <AnimatedHeader
          style={{
            marginTop: collapsibleHeaderHeight + toSize(42) + insets.top,
          }}
          headerHeight={tabHeight}
          translateHeight={collapsibleHeaderHeight}
          scrollY={scrollY}
          opacity={0}
        >
          <GroupTab
            info
            tabData={tabData}
            reviewCount={homeData?.myReviewCount}
            memberCount={homeData?.memberCount}
          />
        </AnimatedHeader>

        {['??????', '??? ??????'].map((item, index) => {
          return (
            <GroupInfoList
              data={data}
              homeData={homeData}
              tabData={tabData}
              setToastText={setToastText}
              refreshMember={refreshMember}
              key={`groupInfo_${index}`}
              visible={type === item}
              type={item}
              sub={MID}
              scrollY={scrollY}
              groupId={groupId}
              handleGetData={handleGetData}
              reviewCount={homeData?.myReviewCount}
              isRefresh={isRefresh}
            />
          );
        })}
      </View>

      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ borderRadius: 30 }}
        backdropComponent={renderBackdrop}
        keyboardBehavior={'extend'}
        // keyboardBlurBehavior={'restore'}
        onChange={handleSheetChanges}
      >
        <InvitationView focus={keyboardFocus} />
      </BottomSheet>

      <AppModal
        visible={myQuitVisible}
        title={'?????? ????????? ???????????????????'}
        content={'?????? ????????? ????????? ??????\nmy > ?????????????????? ????????? ??? ?????????'}
        leftButtonText={'??????'}
        onPressLeft={() => setMyQuitVisible(false)}
        rightButtonText={'?????????'}
        onPressRight={() => {
          setMyQuitVisible(false);
          callApi(deleteGroupsLeave, groupId, handleLeave);
        }}
      />

      <AppModal
        visible={deleteVisible}
        title={'?????? ????????? ??????????????????????'}
        content={
          '????????? ???????????? ??? ?????? ?????????\n?????? ????????? ?????? ????????????\n???????????? ????????? ?????????.'
        }
        leftButtonText={'??????'}
        onPressLeft={() => setDeleteVisible(false)}
        rightButtonText={'????????????'}
        onPressRight={() => {
          setDeleteVisible(false);
          callApi(deleteGroups, groupId, handleLeaveMaster);
        }}
      />

      <AppModal
        visible={serviceVisible}
        title={'????????? ??????????????????!'}
        icon={
          <MyIcon
            name={'ic_warn'}
            size={toSize(40)}
            style={{ marginBottom: toSize(16) }}
          />
        }
        content={
          '??? ?????? ???????????? ?????? ??????????????????.\n?????? ?????? ?????? ???????????????.'
        }
        rightButtonText={'??????'}
        onPressRight={() => {
          setServiceVisible(false);
        }}
      />
    </Screen>
  );
};

export default GroupInfoScreen;
