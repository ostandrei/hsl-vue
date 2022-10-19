<template>
  <div class="page-schedule bootstrap-wrapper">
    <div class="row">
      <div class="col-2">
        <img alt="logo" src="@/assets/img/logo.png"/>
      </div>
      <div class="col-lg-7 col-md-7 col-sm-7 col-xs-5 pos-rel">
        <div class="v-align bold hidden-sm-down">Busses arriving to</div>
      </div>
      <div class="col-3">
        <div class="current-time v-align bold">{{ currentTime }}</div>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-2">
      </div>
      <div class="col-lg-10">
        <div class="row p-0 mx-0">
          <div class="col-12 bold hidden-md-up">Busses arriving to</div>
          <div class="col-12 page-title bold pb-3">{{ result?.stop?.name ?? 'Energia-aukio' }}</div>
        </div>
        <div class="row p-0 mx-0">
          <div class="col-lg-7">
            <div id="results" v-if="result">
              <div class="result-item row p-0 mx-0" v-for="item in filteredResult"
                   :key="item.shortName + '_' + item.scheduledArrival">
                <div class="col-1 status" :class="item.arrivalDelay > 0 ? 'delayed' : ''">
                  <div class="status-bar"></div>
                  <div class="bus-icon"><img alt="footer" src="@/assets/img/bus-icon.png"/></div>
                </div>
                <div class="col-11">
                  <div class="row crow">
                    <div class="col-lg-6 col-md-6 col-sm-6 col-xs-10 bus-no">
                      <div class="row p-0 my-0">
                        <div class="bus col">{{ item.shortName + ' ' }} {{ formatDelay(item) }}</div>
                      </div>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-6 col-xs-10 arrival-time">
                      <div>{{ formatArrival(item) }}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div class="col-4"></div>
        </div>
        <div id="footer">
          <img alt="footer" src="@/assets/img/footer.png"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {ref, computed, onMounted, onUnmounted} from "vue";
import {createApolloClient} from '~/requests/apollo.provider';
import gql from 'graphql-tag'
import moment from 'moment'

export default {
  name: "SchedulePage",
  setup() {
    const apolloClient = createApolloClient();
    const result = ref(null);
    const filteredResult = ref([]);
    let busStop: string;
    const currentTime = ref(null);
    const timerInterval = ref(null);
    const queryTimeout = ref(null);
    const processing = ref(false);

    const formatArrival = computed(() => {
      return (item: object) => {
        if (!Object.keys(item).length) {
          return "-"
        } else {
          const arrTime = moment().startOf('day').seconds(item.realtimeArrival + item.arrivalDelay);
          const now = moment(new Date());
          const elapsed = moment.duration(arrTime.diff(now)).asMinutes();

          // refresh results if one bus has already arrived
          if (elapsed < 0 && !processing.value) {
            query();
            return;
          }
          const elapsedTime = Math.ceil(elapsed);
          if (elapsedTime < 0) {
            return 'In station / ' + arrTime.format('HH:mm')
          } else {
            return 'In ' + elapsedTime + (elapsedTime > 1 ? ' minutes /' : ' minute /') + arrTime.format('HH:mm');
          }

        }
      }
    })

    const formatDelay = computed(() => {
      return (item: object) => {
        if (!Object.keys(item).length || item.arrivalDelay <= 0) return;
        const delay = moment.duration(item.arrivalDelay, 'seconds').asMinutes();
        return '(' + Math.ceil(delay) + (delay > 1 ? ' minutes late)' : ' minute late)');
      }
    })

    onMounted(async () => {
      const urlParams = new URLSearchParams(window.location.search);
      busStop = urlParams.get('stop') ?? 'HSL:1040144';
      await query();
      timerInterval.value = setInterval(function () {
        currentTime.value = moment(new Date()).format('HH:mm');
      }, 1000)
    })

    onUnmounted(() => clearInterval(timerInterval.value))
    onUnmounted(() => clearTimeout(queryTimeout.value))

    async function query() {
      processing.value = true;
      try {
        await apolloClient.query({
          query: gql`
          query product($BussStop: String!) {
            stop(id: $BussStop) {
              name
              lat
              lon
              platformCode
              stoptimesForPatterns{
                pattern{
                  name
                  route{
                    shortName
                    desc
                    agency{
                      gtfsId
                      name
                    }
                  }
                }
                stoptimes{
                  realtime
                  realtimeArrival
                  arrivalDelay
                  scheduledArrival
                }
              }
            }
          }`,
          variables: {
            BussStop: busStop,
          }
        }).then(function (resp: object) {
          result.value = resp.data;
          filteredResult.value.splice(0);
          for (let x = 0; x < resp?.data?.stop?.stoptimesForPatterns.length; x++) {
            const res = resp.data.stop.stoptimesForPatterns;
            res[x].stoptimes.map(function (item: object) {
              filteredResult.value.push({...item, shortName: res[x].pattern.route.shortName});
            })
          }
          // sort results by arrival time
          filteredResult.value.sort((a, b) => a.realtimeArrival > b.realtimeArrival ? 1 : -1);
          queryTimeout.value = setTimeout(function () {
            processing.value = false;
          }, 3000)
        });


      } catch (error) {
        console.error(error);
      }
    }

    return {
      result,
      filteredResult,
      query,
      busStop,
      currentTime,
      formatArrival,
      formatDelay,
      timerInterval,
      processing,
    };
  }
}
</script>
