import React from 'react'
import { filter } from 'fuzzaldrin-plus';
import {
	Table,
	Popover,
	Position,
	Menu,
	Avatar,
	Text,
	Pane,
	Dialog,
	TextDropdownButton,
	Icon,
	SideSheet,
	Button
	// eslint-disable-next-line import/no-unresolved
} from 'evergreen-ui';
import Component from "@reactions/component";
import PropTypes  from 'prop-types';

function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

const Order = {
	NONE: 'NONE',
	ASC: 'ASC',
	DESC: 'DESC'
};

class AdvanceTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			searchQuery: '',
			orderedColumn: 1,
			ordering: Order.NONE,
			column2Show: props.column2Show
		};
	}

	sort = entries => {
		const {displayNameField} = this.props;
		const { ordering, orderedColumn, column2Show } = this.state;
		// Return if there's no ordering.
		if (ordering === Order.NONE) return entries;

		// Get the property to sort each profile on.
		// By default use the `name` property.
		let propKey =  displayNameField;

		// The second column is dynamic.
		if (orderedColumn === 2) propKey = column2Show;
		// The third column is fixed to the `ltv` property.
		if (orderedColumn === 3) propKey = 'ltv';

		return entries.sort((a, b) => {
			let aValue = a[propKey];
			let bValue = b[propKey];

			// Parse money as a number.
			const isMoney = aValue.indexOf('$') === 0;

			if (isMoney) {
				aValue = Number(aValue.substr(1));
				bValue = Number(bValue.substr(1));
			}

			// Support string comparison
			const sortTable = { true: 1, false: -1 };

			// Order ascending (Order.ASC)
			if (ordering === Order.ASC) {
				return aValue === bValue ? 0 : sortTable[aValue > bValue];
			}

			// Order descending (Order.DESC)
			return bValue === aValue ? 0 : sortTable[bValue > aValue];
		});
	};

	// Filter the entries based on the name property.
	filter = entries => {
		const {displayNameField} = this.props;
		const searchQuery = this.state.searchQuery.trim();

		// If the searchQuery is empty, return the profiles as is.
		if (searchQuery.length === 0) return entries;

		return entries.filter(entry => {
			// Use the filter from fuzzaldrin-plus to filter by name.
			const result = filter([entry[displayNameField]], searchQuery);
			return result.length === 1;
		});
	};

	getIconForOrder = order => {
		switch (order) {
			case Order.ASC:
				return 'arrow-up';
			case Order.DESC:
				return 'arrow-down';
			default:
				return 'caret-down';
		}
	};

	handleFilterChange = value => {
		this.setState({ searchQuery: value });
	};

	renderTableHeaderCell = ({fieldName}) => {
		const {orderedColumn, ordering} = this.state;
		return (
			<Table.TextHeaderCell width={200} textProps={{ textAlign: 'left', fontSize: '25px', marginTop: '10px'}}>
				<Popover
					position={Position.BOTTOM_LEFT}
					content={({ close }) => (
						<Menu>
							<Menu.OptionsGroup
								title="Order"
								options={[
									{ label: 'Ascending', value: Order.ASC },
									{ label: 'Descending', value: Order.DESC }
								]}
								selected={
									orderedColumn === 2 ? ordering : null
								}
								onChange={value => {
									this.setState({
										orderedColumn: 2,
										ordering: value
									});
									// Close the popover when you select a value.
									close();
								}}
							/>
						</Menu>
					)}
				>
					<TextDropdownButton
						fontSize='25px'
						textTransform='capitalize'
						icon={
							orderedColumn === 3
								? this.getIconForOrder(ordering)
								: 'caret-down'
						}
					>
						{fieldName.label}
					</TextDropdownButton>
				</Popover>
			</Table.TextHeaderCell>
		)
	};

	renderRowMenu = () => {
		return (
			<Menu>
				<Menu.Group>
					<Menu.Item>Show...</Menu.Item>
					<Menu.Item>Edit...</Menu.Item>
					<Menu.Divider />
					<Menu.Item intent="danger">Delete...</Menu.Item>
				</Menu.Group>
			</Menu>
		)
	};

	renderRow = ({ row }) => {
		const {keyFieldName, displayNameField, deleteRecord, updateRecord, EditComponent, modelName, database} = this.props;
		// get this from schema
		const fields = this.props.fieldNames.filter(f => f.name!== displayNameField);
		// row.observe();
		return (
			<Table.Row key={row[keyFieldName]}>
				<Table.Cell display="flex">
					<Avatar name={row[displayNameField]} />
					<Text marginLeft={8} size={300} fontSize='15px' fontWeight={500}>
						{row[displayNameField]}
					</Text>
				</Table.Cell>
				{
					fields.map(field => <Table.TextCell textProps={{textAlign: 'left', fontSize: '15px'}} key={row[keyFieldName] + field.name}>{row[field.name] ? row[field.name].toString() : ''}</Table.TextCell>)
				}
				<Table.Cell width={120} flex="none">
					<Component initialState={{ isShown: false }}>
						{({ state, setState }) => (
							<React.Fragment>
								<SideSheet
									isShown={state.isShown}
									onCloseComplete={() => setState({ isShown: false })}
								>
									<div style={{ width: '80%', margin: '0 auto'}}>
										<h3 style={{fontSize: '40px', fontWeight: '400', color: '#09d3ac'}}>Details of {modelName}</h3>
										<h4 style={{fontSize: '25px', fontWeight: 'lighter'}} key={displayNameField}><b style={{fontWeight: '400'}}>{capitalize(displayNameField)}</b>: {row[displayNameField]}</h4>
										{
											fields.map(field => {
												let value = row[field.name];
												if (typeof value === 'object') {
													if (value instanceof Date) {
														value = value.toLocaleString().split(',')[0];
													} else {
														console.log(field.name);
														console.log(value);
														database.action(async () => {
															// const item = await value.fetch();
															// console.log(item);
														});
														value = '';
													}
												}
												return <h4 style={{fontSize: '25px', fontWeight: 'lighter'}} key={field.name}>
														<b style={{fontWeight: '400'}}>{capitalize(field.name)}</b>
														: {value || ''}</h4>
												}
											)
										}

										<div style={{ margin: '0 auto', marginTop: '20px'}}>
											<Button onClick={() => setState({ isShown: false })} intent='danger'>Close</Button>
										</div>
									</div>
								</SideSheet>
								<Icon icon="eye-open" onClick={() => setState({ isShown: true })} size={20} color='primary' marginRight={16}/>
							</React.Fragment>
						)}
					</Component>
					<EditComponent row={row} keyFieldName={keyFieldName} modelName={modelName} updateRecord={updateRecord}/>

					<Component initialState={{ isShown: false }}>
						{({ state, setState }) => (
							<Pane>
								<Dialog
									isShown={state.isShown}
									onCloseComplete={() => setState({ isShown: false })}
									hasHeader={false}
									onConfirm={() => {
										deleteRecord(row[keyFieldName]);
										this.setState({ isShown: false});
									}}
									intent="danger"
								>
									Are you sure you want to delete the {modelName} {row[displayNameField]}?
								</Dialog>

								<Icon icon="trash" size={20} color='danger' className="hand-pointer" onClick={() => setState({ isShown: true })}/>
							</Pane>
						)}
					</Component>
					{ /*
						<Popover
							content={this.renderRowMenu}
							position={Position.BOTTOM_RIGHT}
						>
							<IconButton icon="more" height={24}/>
						</Popover>
						*/
					}
				</Table.Cell>
			</Table.Row>
		)
	};

	render() {
		const rows = this.filter(this.sort(this.props.entries));
		const {searchQuery} = this.state;
		const fieldNames = this.props.fieldNames;

		return (
			<Table>
				<Table.Head height={50} accountForScrollbar>
					<Table.SearchHeaderCell
						onChange={this.handleFilterChange}
						value={searchQuery}
						spellCheck
					/>
					{
						fieldNames.map(fieldName => <div key={fieldName.name}>{ this.renderTableHeaderCell({fieldName})} </div>)
					}
					<Table.HeaderCell appearance='minimal' />
				</Table.Head>
				<Table.VirtualBody height={445}>
					{rows.map(row => <div key={row[this.props.keyFieldName]}> {this.renderRow({ row })} </div>)}
				</Table.VirtualBody>
			</Table>
		)
	}
}

AdvanceTable.propTypes = {
	displayNameField: PropTypes.string.isRequired,
	column2Show:PropTypes.string.isRequired,
	keyFieldName: PropTypes.string.isRequired,
	fieldNames: PropTypes.array.isRequired,
	deleteRecord: PropTypes.func.isRequired,
	updateRecord: PropTypes.func.isRequired,
	modelName: PropTypes.string.isRequired,
	EditComponent: PropTypes.func.isRequired,
	database: PropTypes.object.isRequired
};


export default AdvanceTable;
