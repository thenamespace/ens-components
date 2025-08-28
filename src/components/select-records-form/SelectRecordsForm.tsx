
import { useState } from "react"
import { EnsRecords } from "../../types"
import { Icon, Text } from "../atoms"
import { TextRecords } from "./TextRecords"
import { AddressRecords } from "./AddressRecords"
import { ContenthashRecord } from "./ContenthashRecord"
import "./SelectRecordsForm.css"

const NAV_TEXTS = "Text Records"
const NAV_ADDRS = "Address Records"
const WEBSITE = "Website";

const navigation_items: string[] = [
    NAV_TEXTS,
    NAV_ADDRS,
    WEBSITE
]

export interface SelectRecordsFormProps {
    records: EnsRecords
    onRecordsUpdated: (records: EnsRecords) => void
}

export const SelectRecordsForm = ({
    records,
    onRecordsUpdated
}: SelectRecordsFormProps) => {

    const [selectedItem, setSelectedItem] = useState<string>(NAV_TEXTS)

    return <div className="ns-select-records-form">

        {/* // cover and avatar */}
        <div className="ns-cover-cont">
            <div className="ns-avatar-cont">

            </div>
        </div>


        {/* // nav items */}
        <div className="ns-select-records-nav d-flex justify-content-around align-items-center">
            {navigation_items.map(item =>
                <div key={item}
                    onClick={() => setSelectedItem(item)}
                    className={`nav-cont d-flex align-items-center justify-content-center ${selectedItem === item ? "active" : ""}`}>
                    <Text size="sm" weight="medium" color={selectedItem === item ? "primary" : "grey"}>
                        {item}
                    </Text>
                </div>)}
        </div>

        <div className="ns-select-records-content">
            {/* {selectedItem === NAV_TEXTS && <TextSelector />} */}
           { selectedItem === NAV_TEXTS && <TextRecords></TextRecords>}
           { selectedItem === NAV_ADDRS && <AddressRecords/>}
           { selectedItem === WEBSITE && <ContenthashRecord/>}
           <Icon name="person"></Icon>
        </div>
    </div>
}

