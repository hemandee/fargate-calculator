<template>
  <v-app id="inspire">
    <v-content>
      <v-container fluid>
        <v-snackbar
          v-model="msgVis"
          :color="msgColor"
          :timeout="parseInt(3000)"
        >
          <div class="align-center">{{ msg }}</div>
        </v-snackbar>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <h1>Fargate Pricing Calculator</h1>
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-autocomplete
            v-model="selectRegion"
            :items="pricingStruct.regions"
            label="Region"
            filled
          ></v-autocomplete>
        </v-row>
        <v-spacer></v-spacer>
        <v-form>
          <v-row>
            <v-col cols="4" sm="2">
              <v-text-field
                v-model="numberOfTasks"
                label="Number of Tasks"
                type="number"
                :rules="[taskRules]"
              ></v-text-field>
            </v-col>
            <v-col cols="4" sm="2">
              <v-text-field
                v-model="vcpu"
                :rules="[vcpuRules]"
                label="vCPU"
                type="number"
              ></v-text-field>
            </v-col>
            <v-col cols="4" sm="2">
              <v-text-field
                v-model="memory"
                :rules="[memoryRules]"
                label="Memory (GB)"
                type="number"
              ></v-text-field>
            </v-col>
            <v-col cols="4" sm="2">
              <v-text-field
                v-model="runtime"
                :rules="[runtimeRules]"
                label="Runtime per Day"
                type="number"
              ></v-text-field>
            </v-col>
            <v-col cols="4" sm="2" class="pt-5">
              <v-select
                v-model="runtimeSelect"
                :items="runtimeList"
                dense
                outlined
              ></v-select>
            </v-col>
            <v-col cols="4" sm="2" class="pt-7">
              <v-btn
                color="green"
                :disabled="
                  !(
                    memoryCheck &&
                    vcpuCheck &&
                    taskCheck &&
                    runtimeCheck &&
                    selectRegion !== 'null'
                  )
                "
                @click="goButton"
                >Add</v-btn
              >
            </v-col>
          </v-row>
        </v-form>
        <div v-if="selectRegion !== 'null'">
          <v-row>
            <v-col>
              <h3>
                On-Demand
              </h3>
              <p>
                vCPU:
                {{ pricingStruct.products[this.selectRegion].vcpu }} per vCPU
                per hour
              </p>
              <p>
                Memory:
                {{ pricingStruct.products[this.selectRegion].memory }} per GB
                per hour
              </p>
            </v-col>
            <v-col
              ><h3>
                Spot
              </h3>
              <p>
                vCPU:
                {{ pricingStructSpot.products[this.selectRegion].vcpu }} per
                vCPU per hour
              </p>
              <p>
                Memory:
                {{ pricingStructSpot.products[this.selectRegion].memory }} per
                GB per hour
              </p>
            </v-col>
          </v-row>
        </div>
      </v-container>
      <v-card v-if="fargateTable.length > 0">
        <v-card-title>
          <h3>Estimate Results (On-Demand):</h3>
          <v-text-field
            v-model="fargateSearch"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
            dense
            class="shrink pl-3"
          ></v-text-field>
          <v-spacer></v-spacer>
          <div>
            <v-btn small color="blue" @click="clearTable">Clear</v-btn>
          </div>
        </v-card-title>
        <v-card-subtitle>
          <h4>Version: {{ pricingStruct.publicationDate }}</h4>
        </v-card-subtitle>

        <v-data-table
          v-if="fargateTable.length > 0"
          :headers="headers"
          :items="fargateTable"
          height="300px"
          :search="fargateSearch"
          dense
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.uuid">
                <td>{{ item.tasks }}</td>
                <td>{{ item.vcpu }}</td>
                <td>{{ item.memory }}</td>
                <td>{{ item.region }}</td>
                <td>
                  {{ item.hourly }}
                </td>
                <td>
                  {{ Math.round((item.daily + Number.EPSILON) * 1000) / 1000 }}
                </td>
                <td>
                  {{ Math.round((item.weekly + Number.EPSILON) * 1000) / 1000 }}
                </td>
                <td>
                  {{
                    Math.round((item.monthly + Number.EPSILON) * 1000) / 1000
                  }}
                </td>
                <td>
                  {{ Math.round((item.yearly + Number.EPSILON) * 1000) / 1000 }}
                </td>
                <td>
                  <v-icon small class="mr-2" @click="editItem(item)">
                    mdi-delete
                  </v-icon>
                </td>
              </tr>
              <tr class="font-weight-bold title">
                Total
              </tr>
              <tr>
                <th>
                  {{ totalVal.tasks }}
                </th>
                <th>{{ totalVal.vcpu }}</th>
                <th>{{ totalVal.memory }}</th>
                <th>{{ totalVal.region }}</th>
                <th></th>
                <th>
                  {{
                    Math.round((totalVal.daily + Number.EPSILON) * 1000) / 1000
                  }}
                </th>
                <th>
                  {{
                    Math.round((totalVal.weekly + Number.EPSILON) * 1000) / 1000
                  }}
                </th>
                <th>
                  {{
                    Math.round((totalVal.monthly + Number.EPSILON) * 1000) /
                      1000
                  }}
                </th>
                <th>
                  {{
                    Math.round((totalVal.yearly + Number.EPSILON) * 1000) / 1000
                  }}
                </th>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-card>
      <v-divider class="mx-4"></v-divider>
      <v-card v-if="spotTable.length > 0">
        <v-card-title>
          <h3>Estimate Results (Spot):</h3>
          <v-text-field
            v-model="spotSearch"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
            dense
            class="shrink pl-3"
          ></v-text-field>
          <v-spacer></v-spacer>
          <div>
            <v-btn small color="blue" @click="clearSpotTable">Clear</v-btn>
          </div>
        </v-card-title>
        <v-card-subtitle>
          <h4>Version: {{ pricingStructSpot.publicationDate }}</h4>
        </v-card-subtitle>
        <v-data-table
          v-if="spotTable.length > 0"
          :headers="headers"
          :items="spotTable"
          height="300px"
          :search="spotSearch"
          dense
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.uuid">
                <td>{{ item.tasks }}</td>
                <td>{{ item.vcpu }}</td>
                <td>{{ item.memory }}</td>
                <td>{{ item.region }}</td>
                <td>
                  {{ item.hourly }}
                </td>
                <td>
                  {{ Math.round((item.daily + Number.EPSILON) * 1000) / 1000 }}
                </td>
                <td>
                  {{ Math.round((item.weekly + Number.EPSILON) * 1000) / 1000 }}
                </td>
                <td>
                  {{
                    Math.round((item.monthly + Number.EPSILON) * 1000) / 1000
                  }}
                </td>
                <td>
                  {{ Math.round((item.yearly + Number.EPSILON) * 1000) / 1000 }}
                </td>
                <td>
                  <v-icon small class="mr-2" @click="editItemSpot(item)">
                    mdi-delete
                  </v-icon>
                </td>
              </tr>
              <tr class="font-weight-bold title">
                Total
              </tr>
              <tr>
                <th>
                  {{ totalValSpot.tasks }}
                </th>
                <th>{{ totalValSpot.vcpu }}</th>
                <th>{{ totalValSpot.memory }}</th>
                <th>{{ totalValSpot.region }}</th>
                <th></th>
                <th>
                  {{
                    Math.round((totalValSpot.daily + Number.EPSILON) * 1000) /
                      1000
                  }}
                </th>
                <th>
                  {{
                    Math.round((totalValSpot.weekly + Number.EPSILON) * 1000) /
                      1000
                  }}
                </th>
                <th>
                  {{
                    Math.round((totalValSpot.monthly + Number.EPSILON) * 1000) /
                      1000
                  }}
                </th>
                <th>
                  {{
                    Math.round((totalValSpot.yearly + Number.EPSILON) * 1000) /
                      1000
                  }}
                </th>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-card>
    </v-content>
    <v-card align="center">
      <strong>
        <a href="https://aws.amazon.com/fargate/pricing/">
          <h3>Fargate Pricing Documentation</h3>
        </a>
      </strong>
    </v-card>
    <v-footer padless dense>
      <v-col class="text-center" cols="12">
        {{ new Date().getFullYear() }} —
        <strong>
          <a href="https://github.com/hemandee/fargate-calculator">GitHub</a>
        </strong>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
import priceInfo from 'static/default-price.json'
import regionName from 'static/region-name-mapping.json'
import spotPriceInfo from 'static/default-spot-price'
import axios from 'axios'

export default {
  components: {},
  data: () => ({
    msg: 'Default Success Message',
    fargateSearch: '',
    spotSearch: '',
    msgVis: false,
    msgColor: 'blue',
    regionCheck: false,
    vcpuCheck: false,
    memoryCheck: false,
    taskCheck: false,
    runtimeCheck: false,
    numberOfTasks: '',
    memory: '',
    vcpu: '',
    runtime: '',
    runtimeList: ['hours per day', 'sec per day'],
    runtimeSelect: 'hours per day',
    headers: [
      { text: 'No. Tasks', value: 'tasks' },
      { text: 'vCPU', value: 'vcpu' },
      { text: 'Memory', value: 'memory' },
      { text: 'Region', value: 'region' },
      { text: 'Runtime', value: 'hourly' },
      { text: 'Daily', value: 'daily' },
      { text: 'Weekly (7 Days)', value: 'weekly' },
      { text: 'Monthly (30 Days)', value: 'monthly' },
      { text: 'Yearly (365 Days)', value: 'yearly' },
      { text: 'Actions', value: 'actions' }
    ],
    selectRegion: 'null',
    pricingStruct: {
      publicationDate: 'error',
      products: {},
      regions: []
    },
    pricingStructSpot: {
      publicationDate: 'error',
      products: {}
    },
    totalVal: {
      vcpu: 0,
      memory: 0,
      region: '',
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    },
    totalValSpot: {
      vcpu: 0,
      memory: 0,
      region: '',
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    }
  }),
  computed: {
    ...mapState({
      fargateTable: (state) => state.table.fargateTable,
      spotTable: (state) => state.table.spotTable
    })
  },
  watch: {
    fargateTable(newVal) {
      this.calcTotal(newVal)
    },
    spotTable(newVal) {
      this.calcTotalSpot(newVal)
    }
  },
  mounted() {
    const priceURL =
      'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonECS/current/index.json'
    axios
      .get(priceURL)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(
          'Failed to retrieve AWS Price List from API revert to default',
          error
        )
        this.msg =
          'Failed to retrieve AWS Price List from API revert to default'
        this.msgColor = 'red'
        this.msgVis = true
        this.cleanPriceInfo(priceInfo)
      })
      .then((response) => {
        // eslint-disable-next-line no-console
        if (response) {
          console.log('Successfully retrieved AWS Price List from API')
          this.msg = 'Successfully retrieved AWS Price List from API'
          this.msgColor = 'blue'
          this.msgVis = true
          this.cleanPriceInfo(JSON.parse(response.request.response))
          this.spotPriceList()
        }
      })
    this.calcTotal(this.fargateTable)
    // this.vcpuRules(this.vcpu)
    // this.taskRules(this.tasks)
    // this.memoryRules(this.memory)
  },
  methods: {
    goButton(e) {
      if (this.runtimeSelect === 'hours per day' && this.runtime > 24) {
        this.msg = 'Invalid Hours'
        this.msgColor = 'red'
        this.msgVis = true
        return ''
      }
      const totalPerSec =
        this.calcpricecpu(this.vcpu) + this.calcpricememory(this.memory) || 0.0
      const totalPerSecSpot =
        this.calcpricecpuSpot(this.vcpu) +
          this.calcpricememorySpot(this.memory) || 0.0
      let runtimeMultipy = 0.0
      if (this.runtimeSelect === 'hours per day') {
        runtimeMultipy = parseInt(this.runtime) * 3600
      } else if (this.runtimeSelect === 'sec per day') {
        runtimeMultipy = parseInt(this.runtime)
      }
      const input = {
        memory: this.memory,
        vcpu: this.vcpu,
        region: this.selectRegion,
        tasks: this.numberOfTasks,
        hourly: this.runtime + ' ' + this.runtimeSelect,
        daily: totalPerSec * runtimeMultipy,
        weekly: totalPerSec * 7 * runtimeMultipy,
        monthly: totalPerSec * 30 * runtimeMultipy,
        yearly: totalPerSec * 365 * runtimeMultipy
      }
      const inputSpot = {
        memory: this.memory,
        vcpu: this.vcpu,
        region: this.selectRegion,
        tasks: this.numberOfTasks,
        hourly: this.runtime + ' ' + this.runtimeSelect,
        daily: totalPerSecSpot * runtimeMultipy,
        weekly: totalPerSecSpot * 7 * runtimeMultipy,
        monthly: totalPerSecSpot * 30 * runtimeMultipy,
        yearly: totalPerSecSpot * 365 * runtimeMultipy
      }
      this.$store.dispatch('table/actionAddRow', input)
      this.$store.dispatch('table/actionAddRowSpot', inputSpot)
    },
    spotPriceList() {
      const spotPriceUrl =
        'https://dftu77xade0tc.cloudfront.net/fargate-spot-prices.json'
      axios
        .get(spotPriceUrl)
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(
            'Failed to retrieve AWS Spot List from Document use Default Spot Price List',
            error
          )
          // this.msg = 'Failed to retrieve AWS Spot List from Document'
          // this.msgColor = 'red'
          // this.msgVis = true
          this.cleanPriceInfoSpot(spotPriceInfo)
        })
        .then((response) => {
          // eslint-disable-next-line no-console
          if (response) {
            console.log(
              'Successfully retrieved AWS Spot Price List from Document'
            )
            this.msg =
              'Successfully retrieved AWS Spot Price List from Document'
            this.msgColor = 'blue'
            this.msgVis = true
            this.cleanPriceInfoSpot(JSON.parse(response.request.response))
          }
        })
    },
    calcTotal(newVal) {
      const totalVal = {
        vcpu: 0,
        memory: 0,
        region: '',
        hourly: 0,
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
        tasks: 0
      }
      for (const item in newVal) {
        totalVal.vcpu =
          totalVal.vcpu + newVal[item].vcpu * newVal[item].tasks || 0.0
        totalVal.memory =
          totalVal.memory + newVal[item].memory * newVal[item].tasks || 0.0
        totalVal.hourly += parseFloat(newVal[item].hourly) || 0.0
        totalVal.daily += parseFloat(newVal[item].daily) || 0.0
        totalVal.weekly += parseFloat(newVal[item].weekly) || 0.0
        totalVal.monthly += parseFloat(newVal[item].monthly) || 0.0
        totalVal.yearly += parseFloat(newVal[item].yearly) || 0.0
        totalVal.tasks += parseFloat(newVal[item].tasks) || 0.0
      }
      this.totalVal = totalVal
    },
    calcTotalSpot(newVal) {
      const totalValSpot = {
        vcpu: 0,
        memory: 0,
        region: '',
        hourly: 0,
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
        tasks: 0
      }
      for (const item in newVal) {
        totalValSpot.vcpu =
          totalValSpot.vcpu + newVal[item].vcpu * newVal[item].tasks || 0.0
        totalValSpot.memory =
          totalValSpot.memory + newVal[item].memory * newVal[item].tasks || 0.0
        totalValSpot.hourly += parseFloat(newVal[item].hourly) || 0.0
        totalValSpot.daily += parseFloat(newVal[item].daily) || 0.0
        totalValSpot.weekly += parseFloat(newVal[item].weekly) || 0.0
        totalValSpot.monthly += parseFloat(newVal[item].monthly) || 0.0
        totalValSpot.yearly += parseFloat(newVal[item].yearly) || 0.0
        totalValSpot.tasks += parseFloat(newVal[item].tasks) || 0.0
      }
      this.totalValSpot = totalValSpot
    },
    taskRules(input) {
      input = parseFloat(input)
      if (Number.isInteger(input) && input > 0) {
        this.taskCheck = true
        return true
      }
      this.taskCheck = false
      return 'Not an int'
    },
    vcpuRules(input) {
      input = parseFloat(input)
      if (input === 0.5 || input === 0.25) {
        this.vcpuCheck = true
        return true
      } else {
        if (Number.isInteger(input) && input > 0 && input < 5) {
          this.vcpuCheck = true
          return true
        }
        this.vcpuCheck = false
        return 'Not valid vCPU'
      }
    },
    memoryRules(input) {
      input = parseFloat(input)
      if (input === 0.5) {
        this.memoryCheck = true
        return true
      } else {
        if (Number.isInteger(input) && input > 0 && input < 31) {
          this.memoryCheck = true
          return true
        }
        this.memoryCheck = false
        return 'Not valid Memory'
      }
    },
    runtimeRules(input) {
      input = parseFloat(this.runtime)
      if (!Number.isInteger(input) || input <= 0) {
        this.runtimeCheck = false
        return 'Not a valid Entry'
      }

      if (input <= 86400) {
        this.runtimeCheck = true
        return true
      }

      this.runtimeCheck = false
      return 'Not valid Entry'
    },
    clearTable() {
      this.$store.dispatch('table/actionReset')
    },
    clearSpotTable() {
      this.$store.dispatch('table/actionResetSpot')
    },
    editItem(item) {
      this.$store.dispatch('table/actionDeleteItem', item)
    },
    editItemSpot(item) {
      this.$store.dispatch('table/actionDeleteItemSpot', item)
    },
    calcpricecpu(vcpu) {
      const priceUnit =
        this.pricingStruct.products[this.selectRegion].vcpu / 3600
      const tasks = this.numberOfTasks
      console.log('REGION: :', this.selectRegion, ' Price: ', priceUnit)
      return tasks * (priceUnit * vcpu) || 0.0
    },
    calcpricememory(memory) {
      const priceUnit =
        this.pricingStruct.products[this.selectRegion].memory / 3600
      const tasks = this.numberOfTasks
      return tasks * (priceUnit * memory) || 0.0
    },
    calcpricecpuSpot(vcpu) {
      const priceUnit =
        this.pricingStructSpot.products[this.selectRegion].vcpu / 3600
      const tasks = this.numberOfTasks
      return tasks * (priceUnit * vcpu) || 0.0
    },
    calcpricememorySpot(memory) {
      const priceUnit =
        this.pricingStructSpot.products[this.selectRegion].memory / 3600
      const tasks = this.numberOfTasks
      return tasks * (priceUnit * memory) || 0.0
    },
    cleanPriceInfo(input) {
      this.pricingStruct.publicationDate = input.publicationDate || 'error'
      for (const code in input.terms.OnDemand) {
        const unknownKey = Object.keys(input.terms.OnDemand[code])[0]

        const unknownPriceKey = Object.keys(
          input.terms.OnDemand[code][unknownKey].priceDimensions
        )[0]
        const region = input.products[code].attributes.location
        if (!(region in this.pricingStruct.products)) {
          this.pricingStruct.products[region] = {
            vcpu: 0,
            memory: 0
          }
          this.pricingStruct.regions.push(region)
        }
        const price =
          input.terms.OnDemand[code][unknownKey].priceDimensions[
            unknownPriceKey
          ].pricePerUnit.USD
        const priceDescription =
          input.terms.OnDemand[code][unknownKey].priceDimensions[
            unknownPriceKey
          ].description

        if (parseFloat(price) === 0) {
          // console.log(
          //   'type: SKIPPED',
          //   'region: ',
          //   region,
          //   'desc: ',
          //   priceDescription,
          //   'price: ',
          //   price
          // )
        } else if (priceDescription.toLowerCase().search('vcpu') !== -1) {
          // console.log(
          //   'type: vCPU',
          //   'region: ',
          //   region,
          //   'desc: ',
          //   priceDescription,
          //   'price: ',
          //   price
          // )
          this.pricingStruct.products[region].vcpu = parseFloat(price) || 0.0
          // Object.assign(this.pricingStruct.products[region].vcpu, price)
        } else if (priceDescription.search('Memory') !== -1) {
          // console.log(
          //   'type: MEMORY',
          //   'region: ',
          //   region,
          //   'desc: ',
          //   priceDescription,
          //   'price: ',
          //   price
          // )
          this.pricingStruct.products[region].memory = parseFloat(price) || 0.0
        }
      }
      this.pricingStruct.regions = this.pricingStruct.regions.sort()
    },
    cleanPriceInfoSpot(input) {
      for (const val in input.prices) {
        // console.log(
        //   'Region: ',
        //   regionName[input.prices[val].attributes['aws:region']],
        //   ' Label: ',
        //   input.prices[val].attributes['aws:label'],
        //   ' Price: ',
        //   input.prices[val].price.USD
        // )
        this.pricingStructSpot.publicationDate =
          input.metadata['source:version']
        const region = regionName[input.prices[val].attributes['aws:region']]
        if (!(region in this.pricingStructSpot.products)) {
          this.pricingStructSpot.products[
            regionName[input.prices[val].attributes['aws:region']]
          ] = {
            vcpu: 0.0,
            memory: 0.0
          }
        }
        if (
          input.prices[val].attributes['aws:label']
            .toLowerCase()
            .search('vcpu') !== -1
        ) {
          this.pricingStructSpot.products[
            regionName[input.prices[val].attributes['aws:region']]
          ].vcpu = parseFloat(input.prices[val].price.USD) || 0.0
        } else if (
          input.prices[val].attributes['aws:label']
            .toLowerCase()
            .search('gb per hour') !== -1
        ) {
          this.pricingStructSpot.products[
            regionName[input.prices[val].attributes['aws:region']]
          ].memory = parseFloat(input.prices[val].price.USD) || 0.0
        }
      }
    }
  }
}
</script>
